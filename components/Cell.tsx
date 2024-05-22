import React, { useState, useRef, forwardRef } from 'react';
import {
  LayoutAnimation,
  StyleSheet,
  Animated,
  Platform,
  View,
  Text,
} from 'react-native';
import {
  CellSize,
  BorderWidth,
} from './GlobalStyle';
import Touchable from './Touchable';

interface CellProps {
  number: number | null;
  onPress?: (index: number, number: number | null, fixed: boolean) => void;
  index: number;
}

const Cell  = forwardRef(({ number, onPress, index } : CellProps,ref) => {
  const [hints, setHints] = useState<number[]>([]);
  const [editing, setEditing] = useState(false);
  const [highlight, setHighlight] = useState(false);
  const [fixed, setFixed] = useState(false);
  const [toggle, setToggle] = useState(false);
  const anim = useRef(new Animated.Value(0)).current;

  const reset = () => {
    setHints([]);
    setEditing(false);
    setHighlight(false);
    setFixed(false);
    setToggle(false);
    anim.setValue(0);
  };

  const animate = () => {
    if (toggle) return;
    setToggle(true);
    anim.setValue(0);
    Animated.timing(anim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start(() => {
      setToggle(false);
    });
  };

  const onPressHandler = () => {
    onPress && onPress(index, number, fixed);
  };

  const rotate = anim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });
  const scale = anim.interpolate({
    inputRange: [0, 0.1, 0.9, 1],
    outputRange: [1, 1.1, 1.1, 1],
  });
  const transform = [{ rotate }, { scale }];
  const zIndex = toggle ? 100 : 0;
  const filled = typeof number === 'number';
  const text = filled ? (number + 1).toString() : '';
  const hint = hints.map(x => x + 1).join('');

  return (
    <Animated.View style={[styles.cell, filled && styles.filledCell, fixed && styles.fixedCell, highlight && styles.highlightCell, { transform, zIndex }]} >
      {editing ?
        <Text style={[styles.text, styles.editingText]} >{hint}</Text> :
        <Text style={[styles.text, fixed && styles.fixedText, highlight && styles.highlightText]}>{text}</Text>
      }
      <Touchable activeOpacity={fixed ? 1 : 0.8} onPress={onPressHandler} style={styles.handle} />
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  handle: {
    width: CellSize,
    height: CellSize,
    position: 'absolute',
    top: 0,
    left: 0,
  },
  cell: {
    width: CellSize,
    height: CellSize,
    backgroundColor: 'lightyellow',
    borderColor: 'orange',
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: BorderWidth,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  textcell: {
    color: '#333',
    fontSize: CellSize * 2 / 3,
    fontFamily: 'HelveticaNeue',
  },
  editingText: {
    textAlign: 'center',
    textAlignVertical: 'center',
    color: 'teal',
    fontSize: CellSize * 2 / 5,
    marginHorizontal: CellSize / 8,
    ...Platform.select({
      ios: {
        marginTop: CellSize / 12,
        lineHeight: CellSize * 2 / 5
      },
      android: {
        lineHeight: Math.floor(CellSize * 2 / 4),
      },
    })
  },
  filledCell: {
    backgroundColor: 'moccasin',
  },
  fixedCell: {
    backgroundColor: 'khaki',
  },
  fixedText: {
    color: '#666',
  },
  highlightCell: {
    backgroundColor: 'peru',
  },
  highlightText: {
    color: '#fff',
  },
});

export default Cell;
