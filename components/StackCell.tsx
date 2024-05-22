import React, { useState, forwardRef } from 'react';
import { LayoutAnimation, StyleSheet, View, Text } from 'react-native';
import Touchable from './Touchable';
import { CellSize, BorderWidth, BoardWidth } from './GlobalStyle';

const spring = {
  duration: 300,
  update: {
    type: LayoutAnimation.Types.spring,
    springDamping: 0.6,
  },
  delete: {
    type: LayoutAnimation.Types.linear,
    property: LayoutAnimation.Properties.opacity,
  },
};

const Offset = (BoardWidth - CellSize * 9 - BorderWidth * 8) / 2;

type StackCellProps = {
  index: number;
  number: number;
  onPress: (number: number) => void;
}

const StackCell = forwardRef(({ index, number, onPress }: StackCellProps, ref: React.Ref<any>) => {
  const [hide, setHide] = useState(false);
  const [left, setLeft] = useState(BoardWidth / 9 * number + (BoardWidth / 9 - CellSize) / 2);
  const [top, setTop] = useState(index);

  const moveTo = (moveIndex: number, onMoveFinish?: () => void) => {
    const x = moveIndex % 9;
    const y = Math.floor(moveIndex / 9);
    const gap = BorderWidth * 2;
    const newLeft = CellSize * x + gap * (Math.floor(x / 3) + 1) + Offset;
    const newTop = -20 - CellSize * (9 - y) - gap * (Math.floor((8 - y) / 3) + 1);
    LayoutAnimation.configureNext(spring);
    setLeft(newLeft);
    setTop(newTop);
    setTimeout(() => {
    // onMoveFinish();
    }, 300);
  };

  const handlePress = () => {
    onPress(number);
  };

  // if (hide) return null;

  return (
    <Touchable onPress={handlePress} style={[styles.container, { top, left }]}>
      <View style={styles.cell}>
        <Text style={styles.text}>{number + 1}</Text>
      </View>
    </Touchable>
  );
});

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    width: CellSize,
    height: CellSize,
  },
  cell: {
    width: CellSize,
    height: CellSize,
    backgroundColor: 'moccasin',
    borderColor: 'orange',
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: BorderWidth,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: '#666',
    fontSize: CellSize * 2 / 3,
    fontFamily: 'HelveticaNeue',
  }
});

export default StackCell;
