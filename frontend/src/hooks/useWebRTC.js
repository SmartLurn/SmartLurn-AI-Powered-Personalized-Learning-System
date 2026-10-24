
import { useState, useRef, useCallback, useEffect } from "react";
import toast from "react-hot-toast";

const useWebRTC = ({ roomId, user, onMeetingEnded, enabled = true }) => 
{
  //  local camera stream
  const [localStream, setLocalStream] = useState(null);

  // remote participants
  const [remoteUsers, setRemoteUsers] = useState([
    {
      id: "2",
      name: "Aarav",
      isCameraOn: false,
      isMicOn: true,
      stream: null,
    },
    {
      id: "3",
      name: "Priya",
      isCameraOn: false,
      isMicOn: false,
      stream: null,
    },
  ]);

 
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(true);

  // Ref keeps the stream accessible to functions
  const localStreamRef = useRef(null);


  // Initialize the local camera and microphone
  const initLocalStream = useCallback(async () => {
   

    try {
      if (navigator?.mediaDevices?.getUserMedia){
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      localStreamRef.current = stream;
      setLocalStream(stream);
      return stream

    }

    } 
    catch (error) {
      console.error("Could not access camera or microphone:", error);
      toast.error(
        "Camera or microphone access failed. Check your browser permissions."
      );

      return null;
    }
  }, []);



  // Initialize media when enabled; clean it up when disabled or unmounted
  useEffect(() => {
    initLocalStream();
    
    return () => {
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => track.stop());
      }
    }
  }, [initLocalStream]);

  // Toggle microphone
  const toggleAudio = () => {
    const newState = !audioEnabled;
    setAudioEnabled(newState);

    if (localStreamRef.current) {
        const audioTrack=localStreamRef.current.getAudioTracks()[0]
        if (audioTrack) {
            audioTrack.enabled = newState;
        }
    }

    toast(newState ? "Microphone unmuted" : "Microphone muted",{
        icon: newState ? "🔊" : "🔇",
    })
  }

  // Toggle camera
 const toggleVideo = () => {
    const newState = !videoEnabled;
    setVideoEnabled(newState);

    if (localStreamRef.current) {
        const videoTrack=localStreamRef.current.getVideoTracks()[0]
        if (videoTrack) {
            videoTrack.enabled = newState;
        }
    }

    toast(newState ? "Camera turned on" : "Camera turned off",{
    icon: newState ? "📹" : "📷",
    })
  }

  // End the current meeting
  const endMeeting = useCallback(() => {
    
    if(onMeetingEnded){
        onMeetingEnded("Meeting ended");
    }
  }, [onMeetingEnded]);

  return {
    localStream,
    remoteUsers,
    audioEnabled,   
    videoEnabled,
    toggleAudio,
    toggleVideo,
    endMeeting,
  };
}

export default useWebRTC;