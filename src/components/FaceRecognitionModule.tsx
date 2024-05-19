import * as faceapi from "face-api.js";

import { useRef, useEffect, useState } from "react";
let optionsSSDMobileNet: any = null;
interface Props {
  onCurrentUserChange: (newUser: string) => void;
}

function throttle(func: Function, delay: number) {
  let lastCall = 0;

  return function (...args: any[]) {
    const now = new Date().getTime();

    if (now - lastCall < delay) {
      return;
    }

    lastCall = now;
    return func(...args);
  };
}

export const FaceRecognition = ({ onCurrentUserChange }: Props) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [user, setUser] = useState<string | undefined>(undefined);

  const [labels, setLabels] = useState([
    "Aaron",
    "Aki",
    "Akihiro-san",
    "Alex",
    "Ann",
    "Annie",
    "Betty",
    "Brian",
    "Camen",
    "Chang",
    "Chau",
    "Chou",
    "Christ",
    "Cico",
    "Cody",
    "Collins",
    "Cyan",
    "Daniel",
    "Evan",
    "Gabriel",
    "Gordon",
    "Gozu-san",
    "Gu",
    "Hagihara-san",
    "Han Le",
    "Hannah",
    "Harry",
    "Hector",
    "Henry",
    "Heri",
    "Hilary",
    "Hon Keung Jim",
    "Hutson",
    "Jack",
    "Jacky",
    "Jade",
    "Jan",
    "Jason",
    "Jbulls",
    "Jennifer",
    "Jenny",
    "Jessie",
    "JJ",
    "JM",
    "Joey",
    "John Stone",
    "Jun",
    "Justine",
    "Kai",
    "Kai Ling",
    "Kane",
    "Katy",
    "Kaylin",
    "Kevin",
    "Kiko",
    "Lee Jun Yu",
    "Lennon",
    "Levi",
    "Louis",
    "Marcus",
    "Martin",
    "Michida-san",
    "Mikyung",
    "Molly",
    "Nick",
    "Nishikawa-san",
    "Otis",
    "Patty",
    "Paul",
    "Peter",
    "Phoebe",
    "Quinn",
    "Rei",
    "Robert Mazzocco",
    "Roger",
    "Selena",
    "Sergio",
    "Siewpeng",
    "Soonick",
    "Soumya",
    "Stephanie",
    "Sundar",
    "Theo",
    "Tom",
    "Tommy",
    "Trai",
    "Tuyet",
    "Victor",
    "Woohyung",
    "Yahiko",
    "Yan Yu",
    "Yati",
    "Yin Yin",
    "Youngdae",
    "Yuasa-san",
    "Wada-san",
    "MY Lee",
    "Tu",
    "Hoa",
    "Byeon",
    "An",
    "Phillip",
    "Lila",
    "Jack Wong",
    "Arul Vivian",
    "Trisha",
    "Helen",
    "Jacob",
    "Matthew",
    "Min Ke",
    "Kendall",
    "Ingrid Biedenharn",
    "Loc",
    "Vincent",
    "Eunice",
    "Heri",
  ]);

  const handleVideo = async (event: any) => {
    if (!videoRef.current || !canvasRef.current) return;
    const cv = canvasRef.current;
    const rect = videoRef.current.getBoundingClientRect();
    cv.width = rect.width;
    cv.height = rect.height;

    const labeledFaceDescriptors = await getLabeledFaceDescriptions();
    const faceMatcher = new faceapi.FaceMatcher(labeledFaceDescriptors);

    const displaySize = {
      width: canvasRef.current.width,
      height: canvasRef.current.height,
    };

    faceapi.matchDimensions(canvasRef.current, displaySize);

    const recognitionBuffer = Array(10).fill("unknown");
    let recognitionBufferIndex = 0;

    setInterval(async () => {
      if (!videoRef.current || !canvasRef.current) return;

      const detection = await faceapi
        .detectSingleFace(videoRef.current, optionsSSDMobileNet)
        .withFaceLandmarks()
        .withFaceDescriptor();
      if (!detection) {
        return;
      }
      const resizedDetection = faceapi.resizeResults(detection, displaySize);

      const context = canvasRef.current.getContext("2d");
      if (context) {
        context.clearRect(
          0,
          0,
          canvasRef.current.width,
          canvasRef.current.height
        );
      }

      const result = faceMatcher.findBestMatch(resizedDetection.descriptor);

      // draw result on canvas
      const box = resizedDetection.detection.box;
      const drawBox = new faceapi.draw.DrawBox(box, {
        label: result.toString(),
      });
      drawBox.draw(canvasRef.current);

      // update the buffer
      recognitionBuffer[recognitionBufferIndex] = result.label;
      recognitionBufferIndex =
        (recognitionBufferIndex + 1) % recognitionBuffer.length;

      const mostCommonLabel = getMostCommonLabel(recognitionBuffer);
      if (mostCommonLabel !== "unknown") {
        updateUser(mostCommonLabel);
      }
    }, 100);
  };
  const updateUser = throttle((mostCommonLabel: string) => {
    setUser(mostCommonLabel);
    if (onCurrentUserChange) {
      onCurrentUserChange(mostCommonLabel);
    }
  }, 2000);
  const getMostCommonLabel = (recognitionBuffer: string[]): string | null => {
    const counts: { [key: string]: number } = recognitionBuffer.reduce(
      (acc, val) => {
        if (val in acc) {
          acc[val]++;
        } else {
          acc[val] = 1;
        }
        return acc;
      },
      {} as { [key: string]: number }
    );

    let mostCommonLabel: string | null = null;
    let maxCount = -1;
    for (const label in counts) {
      if (counts[label] > maxCount) {
        mostCommonLabel = label;
        maxCount = counts[label];
      }
    }
    return mostCommonLabel;
  };

  useEffect(() => {
    if (!videoRef.current || !canvasRef.current) return;

    (async () => {
      await setupFaceAPI();
      await setupCamera();
    })();

    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((track) => {
          track.stop();
        });
      }
    };
  }, []);

  const setupCamera = async () => {
    if (!videoRef.current || !canvasRef.current) return null;
    let stream;
    const constraints = {
      audio: false,
      video: { facingMode: "user", resizeMode: "crop-and-scale" },
    };
    try {
      stream = await navigator.mediaDevices.getUserMedia(constraints);
    } catch (err) {
      log(`Camera Error: ${err}`);
      return null;
    }
    if (stream) {
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } else {
      log("Camera Error: stream empty");
      return null;
    }
    const track = stream.getVideoTracks()[0];
    const settings = track.getSettings();
    if (settings.deviceId) delete settings.deviceId;
    if (settings.groupId) delete settings.groupId;
    if (settings.aspectRatio)
      settings.aspectRatio = Math.trunc(100 * settings.aspectRatio) / 100;
    log(`Camera active: ${track.label}`);
    log(`Camera settings: ${settings}`);

    if (canvasRef && canvasRef.current) {
      canvasRef.current.addEventListener("click", () => {
        if (videoRef.current && videoRef.current.readyState >= 2) {
          if (videoRef.current.paused) {
            videoRef.current.play();
            log(`Camera play`);
          } else {
            videoRef.current.pause();
            log(`Camera pause`);
          }
        }
      });
    }

    if (videoRef && videoRef.current) {
      videoRef.current.addEventListener("play", handleVideo);
      window.addEventListener("resize", handleVideo);
    }
    return true;
  };
  // LOAD MODELS FROM FACE API
  const getLabeledFaceDescriptions = async () => {
    return Promise.all(
      labels.map(async (label) => {
        const descriptions = [];
        for (let i = 1; i <= 2; i++) {
          const img = await faceapi.fetchImage(`/labels/${label}/${i}.jpg`);
          const detection = await faceapi
            .detectSingleFace(img)
            .withFaceLandmarks()
            .withFaceDescriptor();
          if (!detection) {
            console.log(
              "No face detected in image: /labels/" + label + "/" + i + ".jpg"
            );
            continue; // continue to next iteration if no face is detected
          }
          descriptions.push(detection.descriptor);
        }
        return new faceapi.LabeledFaceDescriptors(label, descriptions);
      })
    );
  };
  const setupFaceAPI = async () => {
    const MODEL_URL = "/models";
    const maxResults = 6;
    await faceapi.loadFaceDetectionModel(MODEL_URL);
    await faceapi.loadFaceLandmarkModel(MODEL_URL);
    await faceapi.loadFaceRecognitionModel(MODEL_URL); // This line is new
    await faceapi.loadAgeGenderModel(MODEL_URL);
    await faceapi.loadFaceExpressionModel(MODEL_URL);
    optionsSSDMobileNet = new faceapi.SsdMobilenetv1Options({
      minConfidence: 0.6,
      maxResults,
    });
    return true;
  };
  const log = (...txt: any[]) => {
    console.log(...txt);
    const div = document.getElementById("log");
    if (div) div.innerHTML += `<br>${txt}`;
  };

  return (
    <div className="myapp">
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          height: "100%",
          width: "100%",
        }}
      >
        <video
          id="video"
          ref={videoRef}
          playsInline
          autoPlay
          muted
          style={{
            width: "auto",
            height: "100%",
          }}
        />
        <canvas
          id="canvas"
          ref={canvasRef}
          style={{
            position: "absolute",
            zIndex: 1,
          }}
        />
      </div>
    </div>
  );
};
