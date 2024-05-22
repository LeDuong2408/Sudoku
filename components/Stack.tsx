import React, { useRef,forwardRef } from 'react';
import { StyleSheet, View } from 'react-native';
import StackCell from './StackCell';

const stack = [0, 1, 2, 3, 4, 5, 6, 7, 8];

type StackProps =  {
  onPress: (number: number) => void;
}

const Stack = forwardRef(({ onPress }: StackProps, ref: React.Ref<any> ) => {


  return (
    <View style={styles.container}>
      {stack.map((_, i) => (
        <View key={i} style={styles.row}>
          {stack.map((item, j) => (
            <StackCell
              key={`${i}-${j}`}
              index={i}
              number={item}
              onPress={onPress}
            />
          ))}
        </View>
      ))}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
  },
  row: {
    flexDirection: 'row',
  },
});

export default Stack;
