import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Mic, MicOff, PhoneOff, Video, VideoOff } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { io, Socket } from 'socket.io-client';
import api from '../../lib/api';
import { Meeting } from '../../types';
import { Button } from '../../components/ui/Button';
import { Card, CardBody, CardHeader } from '../../components/ui/Card';
import { useAuth } from '../../context/AuthContext';

const socketBaseUrl = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/api$/, '');
const rtcConfig = {
  iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
};

export const MeetingRoomPage: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [status, setStatus] = useState('Connecting...');
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);

  const roomPath = useMemo(() => `/meetings/room/${roomId}`, [roomId]);

  useEffect(() => {
    const setupRoom = async () => {
      if (!roomId) {
        return;
      }

      const { data } = await api.get<Meeting>(`/meetings/room/${roomId}`);
      setMeeting(data);

      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      localStreamRef.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      const socket = io(socketBaseUrl);
      socketRef.current = socket;

      const peerConnection = new RTCPeerConnection(rtcConfig);
      peerConnectionRef.current = peerConnection;

      stream.getTracks().forEach((track) => peerConnection.addTrack(track, stream));

      peerConnection.ontrack = (event) => {
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = event.streams[0];
        }
      };

      peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit('ice-candidate', { roomId: roomPath, candidate: event.candidate });
        }
      };

      socket.on('user-connected', async () => {
        setStatus('Participant joined');
        const offer = await peerConnection.createOffer();
        await peerConnection.setLocalDescription(offer);
        socket.emit('offer', { roomId: roomPath, offer });
      });

      socket.on('offer', async ({ offer }) => {
        await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await peerConnection.createAnswer();
        await peerConnection.setLocalDescription(answer);
        socket.emit('answer', { roomId: roomPath, answer });
        setStatus('In call');
      });

      socket.on('answer', async ({ answer }) => {
        await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
        setStatus('In call');
      });

      socket.on('ice-candidate', async ({ candidate }) => {
        if (candidate) {
          await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
        }
      });

      socket.on('user-disconnected', () => {
        setStatus('Other participant left');
      });

      socket.emit('join-room', { roomId: roomPath, userId: user?.id || 'participant' });
      setStatus('Waiting for participant...');
    };

    setupRoom();

    return () => {
      socketRef.current?.disconnect();
      peerConnectionRef.current?.close();
      localStreamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, [roomId, roomPath, user?.id]);

  const toggleTrack = (kind: 'audio' | 'video') => {
    const stream = localStreamRef.current;
    if (!stream) {
      return;
    }

    const tracks = kind === 'audio' ? stream.getAudioTracks() : stream.getVideoTracks();
    tracks.forEach((track) => {
      const nextEnabled = !track.enabled;
      track.enabled = nextEnabled;
      if (kind === 'audio') {
        setIsAudioEnabled(nextEnabled);
      } else {
        setIsVideoEnabled(nextEnabled);
      }
      socketRef.current?.emit('toggle-media', { roomId: roomPath, kind, enabled: nextEnabled });
    });
  };

  const leaveCall = () => {
    socketRef.current?.disconnect();
    peerConnectionRef.current?.close();
    localStreamRef.current?.getTracks().forEach((track) => track.stop());
    navigate('/meetings');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{meeting?.title || 'Meeting Room'}</h1>
        <p className="text-gray-600">{status}</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <h2 className="text-lg font-medium text-gray-900">Your Camera</h2>
          </CardHeader>
          <CardBody>
            <video ref={localVideoRef} autoPlay playsInline muted className="h-[320px] w-full rounded-md bg-black object-cover" />
          </CardBody>
        </Card>
        <Card>
          <CardHeader>
            <h2 className="text-lg font-medium text-gray-900">Remote Participant</h2>
          </CardHeader>
          <CardBody>
            <video ref={remoteVideoRef} autoPlay playsInline className="h-[320px] w-full rounded-md bg-black object-cover" />
          </CardBody>
        </Card>
      </div>

      <div className="flex flex-wrap gap-3">
        <Button variant="outline" leftIcon={isAudioEnabled ? <Mic size={18} /> : <MicOff size={18} />} onClick={() => toggleTrack('audio')}>
          {isAudioEnabled ? 'Mute Audio' : 'Unmute Audio'}
        </Button>
        <Button variant="outline" leftIcon={isVideoEnabled ? <Video size={18} /> : <VideoOff size={18} />} onClick={() => toggleTrack('video')}>
          {isVideoEnabled ? 'Stop Video' : 'Start Video'}
        </Button>
        <Button leftIcon={<PhoneOff size={18} />} onClick={leaveCall}>
          Leave Room
        </Button>
      </div>
    </div>
  );
};
