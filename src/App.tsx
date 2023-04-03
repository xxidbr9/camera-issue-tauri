import { useState, useEffect, useRef } from 'react';

const App = () => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [videoDevices, setVideoDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedVideoDevice, setSelectedVideoDevice] = useState<string>('');
  const [audioDevices, setAudioDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedAudioDevice, setSelectedAudioDevice] = useState<string>('');

  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    // Request camera access and enumerate available devices
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then(mediaStream => {
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
        return navigator.mediaDevices.enumerateDevices();
      })
      .then(devices => {
        const availableVideoDevices = devices.filter(device => device.kind === 'videoinput');
        const availableAudioDevices = devices.filter(device => device.kind === 'audioinput');

        setVideoDevices(availableVideoDevices);
        setAudioDevices(availableAudioDevices);

        if (availableVideoDevices.length > 0) {
          setSelectedVideoDevice(availableVideoDevices[0].deviceId);
        }
        if (availableAudioDevices.length > 0) {
          setSelectedAudioDevice(availableAudioDevices[0].deviceId);
        }

      })
      .catch(error => {
        console.error(error);
        alert('Could not access camera and microphone');
      });
  }, []);

  const startCamera = () => {
    // Check if both a video and audio device have been selected
    if (selectedVideoDevice && selectedAudioDevice) {
      navigator.mediaDevices
        .getUserMedia({
          video: {
            deviceId: { exact: selectedVideoDevice }
          },
          audio: {
            deviceId: { exact: selectedAudioDevice }
          }
        })
        .then(mediaStream => {
          setStream(mediaStream);
          if (videoRef.current) {
            videoRef.current.srcObject = mediaStream;
          }
        })
        .catch(error => {
          console.error(error);
        });
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setSelectedAudioDevice("");
      setSelectedVideoDevice("");
      setStream(null);
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    }
  };

  return (
    <div>
      <div>
        <label htmlFor="video-input">Video:</label>
        <select
          id="video-input"
          value={selectedVideoDevice}
          onChange={event => setSelectedVideoDevice(event.target.value)}
        >
          <option value="">Select a video device</option>
          {videoDevices.map(device => (
            <option key={device.deviceId} value={device.deviceId}>
              {device.label}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="audio-input">Audio:</label>
        <select
          id="audio-input"
          value={selectedAudioDevice}
          onChange={event => setSelectedAudioDevice(event.target.value)}
        >
          <option value="">Select an audio device</option>
          {audioDevices.map(device => (
            <option key={device.deviceId} value={device.deviceId}>
              {device.label}
            </option>
          ))}
        </select>
      </div>
      <div>
        <button onClick={startCamera}>Start Camera</button>
        <button onClick={stopCamera}>Stop Camera</button>
      </div>
      <div>
        <video ref={videoRef} autoPlay playsInline muted />
      </div>
    </div>
  );
};

export default App;
