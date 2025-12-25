import type React from "react";
import {
  useRef,
  useCallback,
  useState,
  type ChangeEvent,
  useEffect,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CiVideoOn } from "react-icons/ci";
import { FaYoutube } from "react-icons/fa";
import { IoMdClose } from "react-icons/io";
import { FiPlay, FiPause } from "react-icons/fi";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface VideoUploaderProps {
  youtubeUrl: string;
  youtubeEmbedUrl: string;
  showYoutubeInput: boolean;
  setYoutubeUrl: React.Dispatch<React.SetStateAction<string>>;
  setYoutubeEmbedUrl: React.Dispatch<React.SetStateAction<string>>;
  setShowYoutubeInput: React.Dispatch<React.SetStateAction<boolean>>;
  onVideoInfoUpdate?: (
    info: {
      name?: string;
      size?: number;
      type?: string;
      thumbnailUrl?: string;
      file?: File; // Add file to pass the actual File object
    } | null
  ) => void;
  uploadedVideoInfo?: {
    name?: string;
    size?: number;
    type?: string;
    thumbnailUrl?: string;
  } | null;
}

export default function VideoUploader({
  youtubeUrl,
  youtubeEmbedUrl,
  showYoutubeInput,
  setYoutubeUrl,
  setYoutubeEmbedUrl,
  setShowYoutubeInput,
  onVideoInfoUpdate,
  uploadedVideoInfo,
}: VideoUploaderProps) {
  const videoInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [uploadedVideo, setUploadedVideo] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string>("");
  const [videoThumbnail, setVideoThumbnail] = useState<string>("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [videoError, setVideoError] = useState<string | null>(null);

  useEffect(() => {
    if (uploadedVideoInfo?.thumbnailUrl) {
      setVideoThumbnail(uploadedVideoInfo.thumbnailUrl);
    }
  }, [uploadedVideoInfo]);

  const MAX_FILE_SIZE = 100 * 1024 * 1024;
  const SUPPORTED_VIDEO_FORMATS = [
    "video/mp4",
    "video/webm",
    "video/ogg",
    "video/quicktime",
    "video/x-msvideo",
    "video/x-flv",
    "video/x-matroska",
  ];

  const generateVideoThumbnail = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const video = document.createElement("video");
      video.preload = "metadata";
      video.muted = true;
      video.playsInline = true;
      const url = URL.createObjectURL(file);
      video.src = url;

      video.onloadedmetadata = () => {
        const seekTime = Math.min(1, video.duration * 0.25);
        video.currentTime = seekTime;
      };

      video.onseeked = () => {
        const canvas = document.createElement("canvas");
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const thumbnailUrl = canvas.toDataURL("image/jpeg", 0.7);
          URL.revokeObjectURL(url);
          resolve(thumbnailUrl);
        } else {
          reject(new Error("Could not get canvas context"));
        }
      };

      video.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error("Error loading video"));
      };
    });
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const validateFile = (file: File): { valid: boolean; error?: string } => {
    if (file.size > MAX_FILE_SIZE) {
      return {
        valid: false,
        error: `File size exceeds limit (${(file.size / (1024 * 1024)).toFixed(
          2
        )}MB > ${MAX_FILE_SIZE / (1024 * 1024)}MB)`,
      };
    }
    if (!SUPPORTED_VIDEO_FORMATS.includes(file.type)) {
      return {
        valid: false,
        error: `Unsupported video format: ${file.type}`,
      };
    }
    return { valid: true };
  };

  const handleVideoUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const validation: any = validateFile(file);
      if (!validation.valid) {
        setVideoError(validation.error);
        return;
      }

      setVideoError(null);
      const url = URL.createObjectURL(file);
      setVideoUrl(url);
      setUploadedVideo(file);
      setIsPlaying(false);
      setYoutubeUrl(""); // Clear YouTube URL
      setYoutubeEmbedUrl(""); // Clear YouTube embed URL

      try {
        const thumbnail = await generateVideoThumbnail(file);
        setVideoThumbnail(thumbnail);
        if (onVideoInfoUpdate) {
          onVideoInfoUpdate({
            name: file.name,
            size: file.size,
            type: file.type,
            thumbnailUrl: thumbnail,
            file: file, // Pass the File object to the parent
          });
        }
      } catch (error) {
        console.error("Error generating thumbnail:", error);
        if (onVideoInfoUpdate) {
          onVideoInfoUpdate({
            name: file.name,
            size: file.size,
            type: file.type,
            file: file,
          });
        }
      }
    }
  };

  const handleVideoDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      const validation: any = validateFile(file);
      if (!validation.valid) {
        setVideoError(validation.error);
        return;
      }

      setVideoError(null);
      const url = URL.createObjectURL(file);
      setVideoUrl(url);
      setUploadedVideo(file);
      setIsPlaying(false);
      setYoutubeUrl("");
      setYoutubeEmbedUrl("");

      try {
        const thumbnail = await generateVideoThumbnail(file);
        setVideoThumbnail(thumbnail);
        if (onVideoInfoUpdate) {
          onVideoInfoUpdate({
            name: file.name,
            size: file.size,
            type: file.type,
            thumbnailUrl: thumbnail,
            file: file,
          });
        }
      } catch (error) {
        console.error("Error generating thumbnail:", error);
        if (onVideoInfoUpdate) {
          onVideoInfoUpdate({
            name: file.name,
            size: file.size,
            type: file.type,
            file: file,
          });
        }
      }
    }
  };

  const toggleVideoPlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      } else {
        videoRef.current.play().catch((error) => {
          console.error("Error playing video:", error);
          setVideoError("Failed to play video. Format may not be supported.");
        });
        setIsPlaying(true);
      }
    }
  };

  const handleVideoError = () => {
    setVideoError("Failed to load video. Format may not be supported.");
  };

  const removeUploadedVideo = () => {
    if (videoUrl) {
      URL.revokeObjectURL(videoUrl);
    }
    setVideoUrl("");
    setVideoThumbnail("");
    setUploadedVideo(null);
    setIsPlaying(false);
    setVideoError(null);
    if (onVideoInfoUpdate) {
      onVideoInfoUpdate(null);
    }
  };

  const handleYoutubeSubmit = () => {
    if (youtubeUrl) {
      let videoId = "";
      if (youtubeUrl.includes("youtube.com/watch?v=")) {
        videoId = youtubeUrl.split("v=")[1].split("&")[0];
      } else if (youtubeUrl.includes("youtu.be/")) {
        videoId = youtubeUrl.split("youtu.be/")[1].split("?")[0];
      }

      if (videoId) {
        setYoutubeEmbedUrl(`https://www.youtube.com/embed/${videoId}`);
        setShowYoutubeInput(false);
        if (videoUrl) {
          URL.revokeObjectURL(videoUrl);
          setVideoUrl("");
          setVideoThumbnail("");
          setUploadedVideo(null);
          setIsPlaying(false);
          if (onVideoInfoUpdate) {
            onVideoInfoUpdate(null);
          }
        }
      } else {
        toast.error("Invalid YouTube URL", {
          position: "top-right",
          autoClose: 4000,
        });
      }
    }
  };

  const removeYoutubeVideo = () => {
    setYoutubeUrl("");
    setYoutubeEmbedUrl("");
  };

  return (
    <motion.div
      className="bg-white p-4 sm:p-5 rounded-lg shadow space-y-4"
      initial={{ x: 50, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ delay: 0.4 }}
    >
      <ToastContainer />
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
        <h2 className="text-lg font-semibold">Product Video (Optional)</h2>
        <div
          className={`flex justify-between items-center ${
            videoUrl ? "cursor-not-allowed opacity-50" : "cursor-pointer"
          }`}
          onClick={() => !videoUrl && setShowYoutubeInput(true)} // Disable click when videoUrl exists
        >
          <FaYoutube size={24} className="mr-1 text-red-600" />
          <h4
            className={`text-sm sm:text-base ${
              videoUrl ? "text-gray-400" : "text-blue-600"
            }`}
          >
            Add YouTube video
          </h4>
        </div>
      </div>

      {videoError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative text-sm mb-4">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{videoError}</span>
        </div>
      )}

      {!videoUrl && !youtubeEmbedUrl ? (
        <div
          className="border-dashed border-2 border-orange-500 p-5 rounded-lg text-center space-y-2 cursor-pointer"
          onClick={() => videoInputRef.current?.click()}
          onDragOver={handleDragOver}
          onDrop={handleVideoDrop}
        >
          <CiVideoOn size={40} className="mx-auto text-gray-400" />
          <p>Click to upload or drag and drop</p>
          <p className="text-xs text-gray-500">MP4, WebM, Ogg up to 100MB</p>
          <motion.input
            type="file"
            ref={videoInputRef}
            className="hidden"
            accept="video/*"
            onChange={handleVideoUpload}
          />
        </div>
      ) : videoUrl ? (
        <div className="relative pt-4 border rounded-lg overflow-hidden">
          <motion.button
            className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 z-10"
            onClick={removeUploadedVideo}
          >
            <IoMdClose size={14} />
          </motion.button>
          <div className="relative w-full h-[200px]">
            <div className={`w-full h-full ${isPlaying ? "block" : "hidden"}`}>
              <video
                ref={videoRef}
                src={videoUrl}
                className="w-full h-full object-contain bg-black"
                onEnded={() => setIsPlaying(false)}
                onError={handleVideoError}
                controls={isPlaying}
                playsInline
              />
            </div>
            {!isPlaying && (
              <div className="w-full h-full bg-black flex items-center justify-center">
                {videoThumbnail ? (
                  <img
                    src={videoThumbnail || "/placeholder.svg"}
                    alt="Video thumbnail"
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                    <CiVideoOn className="w-16 h-16 text-gray-400" />
                  </div>
                )}
              </div>
            )}
            {!isPlaying && (
              <div
                className="absolute inset-0 flex items-center justify-center cursor-pointer"
                onClick={toggleVideoPlay}
              >
                <div className="bg-black bg-opacity-50 rounded-full p-4 hover:bg-opacity-70 transition-all">
                  <FiPlay className="w-8 h-8 text-white" />
                </div>
              </div>
            )}
            {isPlaying && (
              <div
                className="absolute top-2 left-2 cursor-pointer z-10"
                onClick={toggleVideoPlay}
              >
                <div className="bg-black bg-opacity-50 rounded-full p-2 hover:bg-opacity-70 transition-all">
                  <FiPause className="w-4 h-4 text-white" />
                </div>
              </div>
            )}
            <div className="absolute top-2 left-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
              {uploadedVideo?.name || uploadedVideoInfo?.name || "Video"}
              {uploadedVideo?.size || uploadedVideoInfo?.size
                ? ` (${(
                    (uploadedVideo?.size || uploadedVideoInfo?.size || 0) /
                    (1024 * 1024)
                  ).toFixed(2)}MB)`
                : ""}
            </div>
          </div>
        </div>
      ) : (
        <div className="relative pt-4">
          <motion.button
            className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1"
            onClick={removeYoutubeVideo}
          >
            <IoMdClose size={14} />
          </motion.button>
          <iframe
            width="100%"
            height="200"
            src={youtubeEmbedUrl}
            title="YouTube video player"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="rounded-lg"
          ></iframe>
        </div>
      )}

      <AnimatePresence>
        {showYoutubeInput && !videoUrl && (
          <motion.div
            className="mt-2 space-y-2"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                placeholder="Paste YouTube URL here"
                className="flex-1 p-2 border rounded outline-orange-500 border-orange-500 text-sm sm:text-base"
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
              />
              <div className="flex gap-2">
                <button
                  className="bg-blue-600 text-white px-3 py-2 rounded text-sm sm:text-base flex-1 sm:flex-none"
                  onClick={handleYoutubeSubmit}
                >
                  Add
                </button>
                <button
                  className="bg-gray-300 text-gray-700 px-3 py-2 rounded text-sm sm:text-base flex-1 sm:flex-none"
                  onClick={() => setShowYoutubeInput(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
