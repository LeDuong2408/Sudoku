import React, { useState } from 'react';
import { StyleSheet, Text } from 'react-native';

function formatTime(elapsed: number): string {
  const hour = Math.floor(elapsed / 60 / 60);
  const minute = Math.floor(elapsed / 60 - hour * 60);
  const second = elapsed % 60;
  return [hour, minute, second].map(x => x < 10 ? '0' + x : x).join(':');
}

interface TimerProps {
  elapsed?: number;
  disabled?: boolean;
  style?: any;
  disabledStyle?: any;
}

const Timer: React.FC<TimerProps> = ({ elapsed = 0, disabled = true, style, disabledStyle }) => {
  const [paused, setPaused] = useState(false);
  const [timerElapsed, setTimerElapsed] = useState(elapsed);

  let startTime: Date | null = null;
  let interval: any;
  let lastElapsed = 0;

  const start = () => {
    setPaused(false);
    const startTime = new Date(); // Thêm từ khóa const ở đây
    interval = setInterval(() => {
      if (paused) return;
      const currentTime = new Date(); // Thêm từ khóa const ở đây
      const newElapsed = Math.floor((currentTime.getTime() - startTime.getTime()) / 1000) + lastElapsed; // Sử dụng phương thức getTime() để lấy thời gian trong mili giây
      if (newElapsed === timerElapsed) return;
      setTimerElapsed(newElapsed);
    }, 100);
  };
  
  

  const pause = () => {
    setPaused(true);
    lastElapsed = timerElapsed;
    return timerElapsed;
  };

  const resume = () => {
    setPaused(false);
    startTime = new Date();
  };

  const stop = () => {
    if (interval) clearInterval(interval);
    if (paused) setPaused(false);
    return timerElapsed;
  };

  const reset = () => {
    if (interval) clearInterval(interval);
    startTime = null;
    lastElapsed = 0;
    setPaused(false);
    setTimerElapsed(elapsed);
  };

  const setElapsed = (newElapsed: number) => {
    startTime = null;
    lastElapsed = newElapsed;
    setTimerElapsed(newElapsed);
  };

  const getElapsed = () => timerElapsed;

  return (
    <Text style={[styles.text, style, disabled && disabledStyle]}>{formatTime(timerElapsed)}</Text>
  );
};

const styles = StyleSheet.create({
  text: {
    color: 'black',
    fontSize: 20,
    fontWeight: '200',
    fontFamily: 'Menlo',
  },
});

export default Timer;
