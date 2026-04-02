import { useEffect, useEffectEvent, useRef, useState } from 'react';

interface Packet {
  id: number;
  x: number;
  type: 'data' | 'pfc';
}

interface SimulationState {
  bufferLevel: number;
  isCongested: number | boolean; // Using number for boolean logic in some physics engines, keeping flexible
  senderPaused: boolean;
  packets: Packet[];
}

export const useProtocolSimulation = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  
  // UI State (The View)
  const [uiState, setUiState] = useState<SimulationState>({
      bufferLevel: 20,
      isCongested: false,
      senderPaused: false,
      packets: []
  });

  // Physics State (The Model - Mutable Ref)
  const simState = useRef<SimulationState>({
    bufferLevel: 20,
    isCongested: false,
    senderPaused: false,
    packets: []
  });

  const requestRef = useRef<number>(0);
  const packetIdRef = useRef(0);
  const isMounted = useRef(true);

  // Physics Constants
  const BUFFER_THRESHOLD = 80;
  const BUFFER_DRAIN_RATE = 0.5;
  const PACKET_SPEED = 1.5;
  const PFC_SPEED = 3;

  const animate = useEffectEvent(() => {
    if (!isMounted.current) return;

    let state = simState.current;
    
    // 1. Move Packets
    const nextPackets = state.packets.map(p => {
      if (p.type === 'data') return { ...p, x: p.x + PACKET_SPEED };
      if (p.type === 'pfc') return { ...p, x: p.x - PFC_SPEED };
      return p;
    }).filter(p => {
      // Destination Logic
      if (p.type === 'data' && p.x >= 90) {
        state.bufferLevel = Math.min(state.bufferLevel + 5, 100);
        return false;
      }
      if (p.type === 'pfc' && p.x <= 10) {
        state.senderPaused = true;
        return false;
      }
      return true;
    });

    state.packets = nextPackets;

    // 2. Drain Buffer
    state.bufferLevel = Math.max(state.bufferLevel - BUFFER_DRAIN_RATE, 0);

    // 3. Hysteresis (Resume)
    if (state.senderPaused && state.bufferLevel < 40) {
        state.senderPaused = false;
    }
    
    // 4. Spawn Data (Random)
    if (!state.senderPaused && Math.random() < 0.1) {
       packetIdRef.current += 1;
       state.packets.push({ id: packetIdRef.current, x: 5, type: 'data' });
    }
    
    // 5. Trigger PFC (Congestion)
    if (state.bufferLevel > BUFFER_THRESHOLD && !state.senderPaused && !state.isCongested) {
        state.isCongested = true;
        packetIdRef.current += 1;
        state.packets.push({ id: packetIdRef.current, x: 90, type: 'pfc' });
    }
    
    if (state.bufferLevel < BUFFER_THRESHOLD) {
        state.isCongested = false;
    }

    // 6. Sync to UI
    if (isMounted.current) {
        setUiState({ ...state });
        requestRef.current = requestAnimationFrame(animate);
    }
  });

  // Game Loop Management
  useEffect(() => {
    isMounted.current = true;
    if (isPlaying) {
      requestRef.current = requestAnimationFrame(animate);
    }
    return () => {
      isMounted.current = false;
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [isPlaying]);

  const handleBurst = () => {
    const burst = Array.from({ length: 5 }).map((_, i) => ({
        id: packetIdRef.current + i + 1000,
        x: 10 - (i * 5),
        type: 'data' as const
    }));
    
    simState.current.packets = [...simState.current.packets, ...burst];
    simState.current.bufferLevel = Math.min(simState.current.bufferLevel + 20, 100);
    packetIdRef.current += 5;

    setUiState({ ...simState.current });
  };

  const handleReset = () => {
    setIsPlaying(false);
    simState.current = {
        bufferLevel: 20,
        isCongested: false,
        senderPaused: false,
        packets: []
    };
    setUiState({ ...simState.current });
  };

  return {
    uiState,
    isPlaying,
    setIsPlaying,
    handleBurst,
    handleReset,
    BUFFER_THRESHOLD
  };
};
