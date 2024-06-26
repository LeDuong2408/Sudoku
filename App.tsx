import React, { useEffect, useState, useRef } from 'react';
import { Image, ScrollView } from 'react-native';
import { View, Text, TouchableOpacity, TouchableWithoutFeedback, StyleSheet,Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {generate, stringToArray,solve }  from './sudoku';
import CongratulationsModal from './Congratulation';
import GameOver from './Gameover';
import ListTime from './ListTime';
import Timer from './components/Timer';
import { CellSize, BoardWidth, BorderWidth, Color } from './components/GlobalStyle';
import {   app,database }  from './Firebase/firebase';
import { ref, push, set, query, orderByChild, limitToFirst, get,remove, DataSnapshot,DatabaseReference,getDatabase  } from "firebase/database";

type Difficulty = 'easy' | 'medium' | 'hard';
interface ElapsedValue {
  key: string;
  elapsed: number;
}
// Define the time limits for each difficulty level
const allTimeLimit = {"easy": 30000, "medium" : 240000, "hard": 300000}
const db = getDatabase(app);
const App: React.FC = () => {
  const [diff, setDiff] = useState<Difficulty>('easy')
  const [board, setBoard] = useState(generate(diff, false))
  const [strSolve, setStrSolve] = useState(solve(board))
  const [BoardSolve, setBoardSolve] = useState(stringToArray(strSolve))
  const [sudoku_board, setsudoku_board] = useState(stringToArray(board))
  const [copyboard, setCopyboard] = useState(sudoku_board)


  const [isWin, setIsWin] = useState(false)
  const [isGameOver, setIsGameOver] = useState(false)
  const [visibleWin, setVisibleWin] = useState(false)
  const [visibleGameOver, setVisibleGameOver] = useState(false)
  const [difficaltily, setDifficaltily] = useState(false)
  const [currentSquare, setCurrentSquare] = useState('')
  const [hint,setHint] = useState(3)
  const [mistake,setMistake] = useState(0)


  const [timeLimit, setTimeLimit] = useState(allTimeLimit[diff])
  const [tenSecondsStyle, setTenSecondsStyle] = useState(false)
  // const [isRunning, setIsRunning] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  const [elapsedValues, setElapsedValues] = useState<any[]>([]);
  const [isVisibleTimeRank, setVisibleTimeRank] = useState(false)
  // const [isPaused, setIsPaused] = useState(false)
  const [elapsedTime, setElapsedTime] = useState(0);

  const startTimeRef = useRef(0);
  const pauseTimeRef = useRef(0);
  const isPausedRef = useRef(false); // Sử dụng useRef để lưu trữ trạng thái của isPaused


  const start = () => {
    startTimeRef.current = Date.now() - elapsedTime;
    timerRef.current = setInterval(() => {
      if (!isPausedRef.current) {
        setElapsedTime(Date.now() - startTimeRef.current);
      }
    }, 1000);
  };

  const stop = () => {
    if (timerRef.current !== null) {
      clearInterval(timerRef.current);
    }
  };

  const pause = () => {
    if (!isPausedRef.current) {
      pauseTimeRef.current = Date.now();
      isPausedRef.current = true;
    }
  };

  const resume = () => {
    if (isPausedRef.current) {
      const pausedDuration = Date.now() - pauseTimeRef.current;
      startTimeRef.current += pausedDuration;
      isPausedRef.current = false;
    }
  };


  

  const stopppppp = () => {
    // setIsRunning(false);
    if (timerRef.current !== null) {
      clearInterval(timerRef.current);
    }
  };

  const hanleSetElapsedValues = () =>{
    getElapsedValues('easy')
  .then((values) => {
    // Sắp xếp mảng theo thứ tự tăng dần của giá trị elapsed
    values.sort((a, b) => a.elapsed - b.elapsed);

    // Chỉ lấy 5 giá trị nhỏ nhất
    const smallestValues = values.slice(0, 5);

    // Set giá trị elapsedValues với 5 giá trị nhỏ nhất
    setElapsedValues(smallestValues);
  })
  .catch((error) => {
    console.error("Đã xảy ra lỗi khi lấy dữ liệu:", error);
  });
  }

  const loadSudokuArray = async () => {
    try {
      const savedSudokuArray = await AsyncStorage.getItem('sudoku'); // Lấy mảng Sudoku từ AsyncStorage
      const elap = await AsyncStorage.getItem('elapsed'); // Lấy mảng Sudoku từ AsyncStorage
      if (savedSudokuArray !== null) {
        // setIsContinue(true);
        setsudoku_board(JSON.parse(savedSudokuArray)); // Chuyển đổi chuỗi JSON thành mảng và cập nhật state
        if(elap != null)
        setElapsedTime(parseInt(elap));
      console.log(elap)
      }
    } catch (error) {
      setBoard(generate(diff, false))
      setStrSolve(solve(board))
    }
  };

  const saveSudokuArray = async () => {
    try {
      await AsyncStorage.setItem('sudoku', JSON.stringify(sudoku_board)); // Chuyển đổi mảng thành chuỗi JSON và lưu vào AsyncStorage
      console.log('Sudoku array saved successfully!');
    } catch (error) {
      console.log('Error saving Sudoku array:', error);
    }
  };
  const saveElaspedTime = async () => {
    try {
      await AsyncStorage.setItem('elapsed', JSON.stringify(elapsedTime.toString())); // Chuyển đổi mảng thành chuỗi JSON và lưu vào AsyncStorage
      console.log('Elasped Save:', elapsedTime)
    } catch (error) {
      console.log('Error saving Sudoku array:', error);
    }
  };
  //Firebase

  const writeTimeData = async (difficul: any, elapsed: any) => {
    const timeRankSudokuRef: DatabaseReference = ref(database, `TimeRankSudoku/${difficul}`);
    const queryRef = query(timeRankSudokuRef, orderByChild('elapsed'), limitToFirst(10));

    try {
        // Get the current fastest times
        const snapshot = await get(queryRef);
        let numChildren = 0;
        snapshot.forEach(() => {
            numChildren++;
        });

        // If there are less than 10 times or the new time is faster than the slowest time
        if (numChildren < 10) {
            // Add the new time
            const newTimeRef = push(timeRankSudokuRef);
            await set(newTimeRef, { elapsed: elapsed });
        } else {
            // If there are already 10 times, remove the slowest time
            const currentFastestTimes: any[] = [];
            snapshot.forEach((childSnapshot) => {
                currentFastestTimes.push(childSnapshot.val());
            });
            currentFastestTimes.sort((a, b) => a.elapsed - b.elapsed);

            const slowestKey = Object.keys(currentFastestTimes[9])[0];
            await remove(ref(database, `TimeRankSudoku/${difficul}/${slowestKey}`));
            // Add the new time
            const newTimeRef = push(timeRankSudokuRef);
            await set(newTimeRef, { elapsed });
        }
    } catch (error) {
        console.error(error);
    }
};
async function getElapsedValues(difficulty:any) {
  try {
      // Lấy tham chiếu đến cơ sở dữ liệu Firebase

      // Tạo đường dẫn đến nút dữ liệu cho độ khó đã cho
      const path = `TimeRankSudoku/${difficulty}`;

      // Thực hiện truy vấn để lấy danh sách các key trong nút dữ liệu
      const snapshot = await get(ref(db, path));

      // Mảng để lưu trữ giá trị elapsed từ mỗi key
      const elapsedValues: any[]  = [];

      // Lặp qua các key và lấy giá trị elapsed của mỗi key
      snapshot.forEach((childSnapshot) => {
          // const key = childSnapshot.key; // Lấy key của mỗi child
          const elapsed = childSnapshot.child("elapsed").val(); // Lấy giá trị elapsed của mỗi child
          elapsedValues.push({ elapsed }); // Thêm key và elapsed vào mảng
      });

      // Trả về mảng các giá trị elapsed
      return elapsedValues;
  } catch (error) {
      // Xử lý các trường hợp lỗi nếu có
      console.error("Đã xảy ra lỗi khi đọc dữ liệu:", error);
      throw error; // Ném lại lỗi để xử lý ở mức cao hơn nếu cần
  }
}


  useEffect(() => {
    return () => {if (timerRef.current !== null) {
    clearInterval(timerRef.current);
  }
}},[]);
  useEffect(() => {
    
    setBoard(generate(diff, false))
    setStrSolve(solve(board))
    // loadSudokuArray();
    fillBoard();
  }, []);

  useEffect(() => {
    setTimeLimit(allTimeLimit[diff]);
  }, [diff]);

  useEffect(() => {
      if (elapsedTime >= timeLimit)
      {
        setIsGameOver(true);
        setVisibleGameOver(true);
        stop();
      }
      else if(elapsedTime >= timeLimit -15000 && elapsedTime < timeLimit - 10000)
      {
        setTenSecondsStyle(true);

      }
      else if(elapsedTime >= timeLimit-10000 && elapsedTime < timeLimit){
        if(tenSecondsStyle == false){
          setTenSecondsStyle(true);
        }
        else{
          setTenSecondsStyle(false);
        }
      }
  },[elapsedTime]);
  
  useEffect(() => {
    if(difficaltily == true){
      pause()
    }
    else{
      resume()
    }
  },[difficaltily]);

  useEffect(() => {
    setCopyboard(sudoku_board)
    // console.log('Difficulty State useEffect: ', diff);
    // console.log('Board Sudoku UseEffect:', sudoku_board);
    // console.log(elapsedValues)
    setElapsedTime(0)
    startTimeRef.current = 0
    pauseTimeRef.current = 0
    isPausedRef.current = (false)
    setTenSecondsStyle(false);
    setIsGameOver(false);
    setVisibleGameOver(false);
    setIsWin(false);
    setVisibleWin(false)
    stop()
    start()
    fillBoard();
    // saveSudokuArray();
  }, [diff, sudoku_board]);

  useEffect(() => {
    setStrSolve(solve(board))
    setsudoku_board(stringToArray(board))
    setInCorrectCell(initIncorrectCell())
  },[board]);

  useEffect(() => {
    setBoardSolve(stringToArray(strSolve))
  },[strSolve]);

  useEffect(() => {
    if(isWin == true){
      setCopyboard(BoardSolve)
    }
  },[isWin]);
  
  const handRequestCloseWin = () => {
    setVisibleWin(false);
  }
  const handleRequestCloseGameover = () => {
    setIsGameOver(false);
  }
  const handlePlayAgain = () => {
    setVisibleGameOver(false)
    isPausedRef.current =(false)
    handleNewGame()
  }

  const difficaltilyContainer = () => {
    return (
  <TouchableWithoutFeedback onPress={() => pressDifficaltily()}>
    <View style={{ width:'100%' , height: '100%',flex:1 ,position: "absolute", justifyContent:'center',alignItems:'center'}}>
      
      <View style={{ position: "absolute",backgroundColor: "white",  borderColor: '#5F9EA0',borderWidth: StyleSheet.hairlineWidth + 5, borderRadius: BorderWidth,}}>
        <TouchableOpacity style={{width: 200, height: 60, justifyContent: 'center', alignItems: 'center', borderWidth: 0.5}} onPress={() => handleChoiseDiff('easy')}>
          <Text style={{fontSize: 25}}>Easy</Text>
        </TouchableOpacity>
        <TouchableOpacity style={{width: 200, height: 60, justifyContent: 'center', alignItems: 'center', borderWidth: 0.5}} onPress={() => handleChoiseDiff('medium')}>
          <Text style={{fontSize: 25}}>Medium</Text>
        </TouchableOpacity>
        <TouchableOpacity style={{width: 200, height: 60, justifyContent: 'center', alignItems: 'center', borderWidth: 0.5}} onPress={() => handleChoiseDiff('hard')}>
          <Text style={{fontSize: 25}}>Hard</Text>
        </TouchableOpacity>
      </View>
      
    </View>
  </TouchableWithoutFeedback>
    )
  }

  const handleVisibleTimeRank = () => {
    setVisibleTimeRank(true);
    pause();
  }
  const handleCloseTimeRank = () => {
    setVisibleTimeRank(false);
    resume();
  }
  function formatTime(elapsed: number): string {
    const hour = Math.floor(elapsed / 60 / 60);
    const minute = Math.floor(elapsed / 60 - hour * 60);
    const second = elapsed % 60;
    return [hour, minute, second].map(x => x < 10 ? '0' + x : x).join(':');
  }
  
  function fillBoard() {
    const newState = { ...squareState };
    for (let row = 1; row <= 9; row++) {
      for (let column = 1; column <= 9; column++) {
        const id = row*10+column;
        newState[`square${id}`] = sudoku_board[row - 1][column - 1] === 0 ? "" : sudoku_board[row - 1][column - 1];
      }
    }
    setSquareState(newState)
  }

  const pressDifficaltily = () => {
    setDifficaltily(!difficaltily)
  }

  const handleChoiseDiff = (difficul:Difficulty) => {
    setIsWin(false)
    setIsGameOver(false)
    setHint(3)
    setMistake(0)
    setElapsedTime(0)
    // setIsContinue(false);
    stop()
    setDifficaltily(!difficaltily);
    setDiff(difficul);
    setBoard(generate(difficul, false))
    // setsudoku_board(stringToArray(boardgenerate))
    // console.log('Set Board Sudoku:',sudoku_board)
    // console.log('Board generated: ', boardgenerate)
    // // setCopyboard(sudoku_board)
    // let solveBoardString = solve(boardgenerate)
    // setStrSolve(solveBoardString)
    // setBoardSolve(solveBoardString)
    // console.log("new gamr: ", sudoku_board)
    // console.log("new gamr solve: ",BoardSolve)
    setCurrentSquare("")
    // fillBoard()
  }
  
  const handleNewGame = () => {
    setIsWin(false)
    setIsGameOver(false)
    setVisibleTimeRank(false)
    setHint(3)
    setMistake(0)
    startTimeRef.current = 0
    pauseTimeRef.current = 0
    isPausedRef.current = (false)
    setElapsedTime(0)
    // setIsContinue(false);
    stop()
    
    setBoard(generate(diff, false))
    // console.log('Difficulty State New Game: ', diff)
    // setsudoku_board(stringToArray(boardgenerate))
    // // console.log('New Board:',sudoku_board)
    // setStrSolve(solve(board))
    // setBoardSolve(stringToArray(strSolve))
    // setCopyboard(sudoku_board)

    // console.log("new gamr: ", sudoku_board)
    // console.log("new gamr solve: ",BoardSolve)
    setCurrentSquare("")
  }
  const handleCellPress = (id:string) => {
    const column = parseInt(id.charAt(7));
    const row = parseInt(id.charAt(6));
    if (copyboard[row-1][column-1] == 0)
      setCurrentSquare(id);
  }
  
  const initSquareState = () => {
    const state: { [key: string]: string | number } = {};
    for (let i = 11; i <= 99; i++) {
      state[`square${i}`] = '0';
    }
    return state;
  };
  const initIncorrectCell = () => {
    const state: { [key: string]:  boolean } = {};
    for (let i = 11; i <= 99; i++) {
      state[`${i}`] = false;
    }
    return state;
  }

  const [inCorrectCell , setInCorrectCell] = useState(initIncorrectCell());
  const [squareState, setSquareState] = useState(initSquareState());
  const checkIncorrectCell = (incorrectstate:any) => {
    for (let i = 11; i <= 99; i++) {
        if (incorrectstate[`${i}`] == true){
            return true;
        }
      }
    
    return false;
  }

  const handleClickNumber = (number: string) => {
  if (isGameOver != true || isWin != true){

    if (currentSquare != "" ){
      const newState = { ...squareState };
      const column = parseInt(currentSquare.charAt(7));
      const row = parseInt(currentSquare.charAt(6));
      if (newState[currentSquare] != BoardSolve[row-1][column-1]){
        const n = number
        newState[currentSquare] = number;
        setSquareState(newState);
        // console.log(newState)
        
        if (mistake<=2){
          if (parseInt(n) != BoardSolve[row-1][column-1] )
            {
              const incorrectstate = { ...inCorrectCell };
              incorrectstate[`${row}${column}`] = true;
              setInCorrectCell(incorrectstate);
              //Alert.alert('Notification',"WRONG")
              setMistake((r) => r+1)
              // Alert.alert('Mistake'+ mistake)
          }
          else {
            const incorrectstate = { ...inCorrectCell };
            incorrectstate[`${row}${column}`] = false;
            setInCorrectCell(incorrectstate);
            checkWin(newState,incorrectstate)
          }
        }

        if ((mistake +1)>2){
          setIsGameOver(true)
          setVisibleGameOver(true);
          stop();
          // Alert.alert(visible)
          // Alert.alert('game over')
          // CongratulationForm();
          // handleNewGame()
        }
      }
    }
  }
}
  const handleErase = () => {
    if (isGameOver != true || isWin != true){
      if (currentSquare != "" ){
        const newState = { ...squareState };
        const column = parseInt(currentSquare.charAt(7));
        const row = parseInt(currentSquare.charAt(6));
        if (newState[currentSquare] != BoardSolve[row-1][column-1]){
          newState[currentSquare] = 0;
          const incorrectstate = { ...inCorrectCell };
          incorrectstate[`${row}${column}`] = false;
          setInCorrectCell(incorrectstate);
          setSquareState(newState);
        }
      }
    }
  }

  const handleHint = () => {
  if (isGameOver != true || isWin != true){
    if (currentSquare != ""){
      if (hint>0){
      const column = parseInt(currentSquare.charAt(7));
      const row = parseInt(currentSquare.charAt(6));
      const newState = { ...squareState };
        if (newState[currentSquare] != BoardSolve[row-1][column-1]){
          newState[currentSquare] = BoardSolve[row-1][column-1];
          const incorrectstate = { ...inCorrectCell };
          incorrectstate[`${row}${column}`] = false;
          setInCorrectCell(incorrectstate);
          setSquareState(newState);
          checkWin(newState,incorrectstate)
          setHint((pre) =>  pre -1)
        }
      }
      else
        Alert.alert("Notification","Not enough hints")
    }
  }
}
//     useEffect(() => {
//         checkWin(squareState)
// },[inCorrectCell,squareState]);

  const handleSolve = () => {
    if(isWin != true){
    const newState = { ...squareState };
    for (let row = 1; row <= 9; row++) {
      for (let column = 1; column <= 9; column++) {
        const id = row*10+column;
        newState[`square${id}`] = BoardSolve[row - 1][column - 1] === 0 ? 0 : BoardSolve[row - 1][column - 1];
      }
    }
    setSquareState(newState)
    setCopyboard(BoardSolve)
    setTenSecondsStyle(false)
    setCurrentSquare("")
    stop()
    setInCorrectCell(initIncorrectCell())
  }
  }
  const checkWin = (newState: any, incorrectstate:any) => {
      if( checkIncorrectCell(incorrectstate) == false){
        let flag = true;
        for (let i = 11; i <= 99; i++) {
            if ((newState[`square${i}`] == 0 || newState[`square${i}`] == '0' ) && i%10!=0){
                // console.log("saiii", i)
                flag = false;
                break
            }
        }
        if (flag){
        setVisibleWin(true);
        // Alert.alert("Notification","Congratulation, You Won")
        setIsWin(true)
        writeTimeData(diff,elapsedTime)
        stop()
        setCurrentSquare("")
        }
      }

        
    }
  return (
    <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
    <ScrollView contentContainerStyle={styles.container}>
    <ListTime  visible={isVisibleTimeRank} handleCloseTimeRank={handleCloseTimeRank}></ListTime>
    <View style={{flex:2,flexDirection:'row', width: BoardWidth-50,justifyContent:'space-between',}}>
      <View style={{justifyContent:'flex-end'}}>
      <TouchableOpacity activeOpacity={0.8} style={[styles.timeRankButton,]} onPress={() => {handleVisibleTimeRank()}}><Image style={styles.imageRank} source={require('./image/menu.png')}></Image></TouchableOpacity>
      </View>
      <View style={{justifyContent:'flex-end'}}>
      <Text style={[ styles.textTimer, tenSecondsStyle == true ? styles.warningTimer : styles.notWarningTimer, ]}>{formatTime(Math.floor((timeLimit- (elapsedTime || 1000) + 1000) / 1000))}</Text>
      </View>
    </View>
      <View style={styles.gameBoard}>
        {/* 9th Rank */}
        <View style={[styles.cell, styles.top, styles.left, currentSquare === 'square91' ? styles.clickedSquare : null,   ]}><TouchableOpacity  onPress={() => handleCellPress('square91')}><Text style={[styles.textcell, inCorrectCell['91'] === true ? styles.incorrectCell : null]}>{squareState['square91'] == 0 ? '   ' : squareState['square91']}</Text></TouchableOpacity></View>
        <View style={[styles.cell, styles.top, currentSquare === 'square92' ? styles.clickedSquare : null,]}><TouchableOpacity onPress={() => handleCellPress('square92')}><Text style={[styles.textcell, inCorrectCell['92'] === true ? styles.incorrectCell : null]}>{squareState['square92'] == 0 ? '                  ' : squareState['square92']}</Text></TouchableOpacity></View>
        <View style={[styles.cell, styles.top, styles.right, currentSquare === 'square93' ? styles.clickedSquare : null,]}><TouchableOpacity onPress={() => handleCellPress('square93')}><Text style={[styles.textcell, inCorrectCell['93'] === true ? styles.incorrectCell : null]}>{squareState['square93'] == 0 ? '                  ' : squareState['square93']}</Text></TouchableOpacity></View>
        <View style={[styles.cell, styles.top, currentSquare === 'square94' ? styles.clickedSquare : null,]}><TouchableOpacity onPress={() => handleCellPress('square94')}><Text style={[styles.textcell, inCorrectCell['94'] === true ? styles.incorrectCell : null]}>{squareState['square94'] == 0 ? '                  ' : squareState['square94']}</Text></TouchableOpacity></View>
        <View style={[styles.cell, styles.top, currentSquare === 'square95' ? styles.clickedSquare : null,]}><TouchableOpacity onPress={() => handleCellPress('square95')}><Text style={[styles.textcell, inCorrectCell['95'] === true ? styles.incorrectCell : null]}>{squareState['square95'] == 0 ? '                  ' : squareState['square95']}</Text></TouchableOpacity></View>
        <View style={[styles.cell, styles.top, styles.right, currentSquare === 'square96' ? styles.clickedSquare : null,]}><TouchableOpacity onPress={() => handleCellPress('square96')}><Text style={[styles.textcell, inCorrectCell['96'] === true ? styles.incorrectCell : null]}>{squareState['square96'] == 0 ? '                  ' : squareState['square96']}</Text></TouchableOpacity></View>
        <View style={[styles.cell, styles.top, currentSquare === 'square97' ? styles.clickedSquare : null,]}><TouchableOpacity onPress={() => handleCellPress('square97')}><Text style={[styles.textcell, inCorrectCell['97'] === true ? styles.incorrectCell : null]}>{squareState['square97'] == 0 ? '                  ' : squareState['square97']}</Text></TouchableOpacity></View>
        <View style={[styles.cell, styles.top, currentSquare === 'square98' ? styles.clickedSquare : null,]}><TouchableOpacity onPress={() => handleCellPress('square98')}><Text style={[styles.textcell, inCorrectCell['98'] === true ? styles.incorrectCell : null]}>{squareState['square98'] == 0 ? '                  ' : squareState['square98']}</Text></TouchableOpacity></View>
        <View style={[styles.cell, styles.top, styles.right, currentSquare === 'square99' ? styles.clickedSquare : null,]}><TouchableOpacity onPress={() => handleCellPress('square99')}><Text style={[styles.textcell, inCorrectCell['99'] === true ? styles.incorrectCell : null]}>{squareState['square99'] == 0 ? '                  ' : squareState['square99']}</Text></TouchableOpacity></View>
        {/* 8th Rank */}
        <View style={[styles.cell, styles.left, currentSquare === 'square81' ? styles.clickedSquare : null,]}><TouchableOpacity onPress={() => handleCellPress('square81')}><Text style={[styles.textcell, inCorrectCell['81'] === true ? styles.incorrectCell : null]}>{squareState['square81'] == 0 ? '                  ' : squareState['square81']}</Text></TouchableOpacity></View>
        <View style={[styles.cell, currentSquare === 'square82' ? styles.clickedSquare : null,]}><TouchableOpacity onPress={() => handleCellPress('square82')}><Text style={[styles.textcell, inCorrectCell['82'] === true ? styles.incorrectCell : null]}>{squareState['square82'] == 0 ? '                  ' : squareState['square82']}</Text></TouchableOpacity></View>
        <View style={[styles.cell, styles.right, currentSquare === 'square83' ? styles.clickedSquare : null,]}><TouchableOpacity onPress={() => handleCellPress('square83')}><Text style={[styles.textcell, inCorrectCell['83'] === true ? styles.incorrectCell : null]}>{squareState['square83'] == 0 ? '                  ' : squareState['square83']}</Text></TouchableOpacity></View>
        <View style={[styles.cell, currentSquare === 'square84' ? styles.clickedSquare : null,]}><TouchableOpacity onPress={() => handleCellPress('square84')}><Text style={[styles.textcell, inCorrectCell['84'] === true ? styles.incorrectCell : null]}>{squareState['square84'] == 0 ? '                  ' : squareState['square84']}</Text></TouchableOpacity></View>
        <View style={[styles.cell, currentSquare === 'square85' ? styles.clickedSquare : null,]}><TouchableOpacity onPress={() => handleCellPress('square85')}><Text style={[styles.textcell, inCorrectCell['85'] === true ? styles.incorrectCell : null]}>{squareState['square85'] == 0 ? '                  ' : squareState['square85']}</Text></TouchableOpacity></View>
        <View style={[styles.cell, styles.right, currentSquare === 'square86' ? styles.clickedSquare : null,]}><TouchableOpacity onPress={() => handleCellPress('square86')}><Text style={[styles.textcell, inCorrectCell['86'] === true ? styles.incorrectCell : null]}>{squareState['square86'] == 0 ? '                  ' : squareState['square86']}</Text></TouchableOpacity></View>
        <View style={[styles.cell, currentSquare === 'square87' ? styles.clickedSquare : null,]}><TouchableOpacity onPress={() => handleCellPress('square87')}><Text style={[styles.textcell, inCorrectCell['87'] === true ? styles.incorrectCell : null]}>{squareState['square87'] == 0 ? '                  ' : squareState['square87']}</Text></TouchableOpacity></View>
        <View style={[styles.cell, currentSquare === 'square88' ? styles.clickedSquare : null,]}><TouchableOpacity onPress={() => handleCellPress('square88')}><Text style={[styles.textcell, inCorrectCell['88'] === true ? styles.incorrectCell : null]}>{squareState['square88'] == 0 ? '                  ' : squareState['square88']}</Text></TouchableOpacity></View>
        <View style={[styles.cell, styles.right, currentSquare === 'square89' ? styles.clickedSquare : null,]}><TouchableOpacity onPress={() => handleCellPress('square89')}><Text style={[styles.textcell, inCorrectCell['89'] === true ? styles.incorrectCell : null]}>{squareState['square89'] == 0 ? '                  ' : squareState['square89']}</Text></TouchableOpacity></View>
        {/* 7th Rank */}
        <View style={[styles.cell, styles.left, styles.bottom, currentSquare === 'square71' ? styles.clickedSquare : null,]}><TouchableOpacity onPress={() => handleCellPress('square71')}><Text style={[styles.textcell, inCorrectCell['71'] === true ? styles.incorrectCell : null]}>{squareState['square71'] == 0 ? '                  ' : squareState['square71']}</Text></TouchableOpacity></View>
        <View style={[styles.cell, styles.bottom, currentSquare === 'square72' ? styles.clickedSquare : null,]}><TouchableOpacity onPress={() => handleCellPress('square72')}><Text style={[styles.textcell, inCorrectCell['72'] === true ? styles.incorrectCell : null]}>{squareState['square72'] == 0 ? '                  ' : squareState['square72']}</Text></TouchableOpacity></View>
        <View style={[styles.cell, styles.right, styles.bottom, currentSquare === 'square73' ? styles.clickedSquare : null,]}><TouchableOpacity onPress={() => handleCellPress('square73')}><Text style={[styles.textcell, inCorrectCell['73'] === true ? styles.incorrectCell : null]}>{squareState['square73'] == 0 ? '                  ' : squareState['square73']}</Text></TouchableOpacity></View>
        <View style={[styles.cell, styles.bottom, currentSquare === 'square74' ? styles.clickedSquare : null,]}><TouchableOpacity onPress={() => handleCellPress('square74')}><Text style={[styles.textcell, inCorrectCell['74'] === true ? styles.incorrectCell : null]}>{squareState['square74'] == 0 ? '                  ' : squareState['square74']}</Text></TouchableOpacity></View>
        <View style={[styles.cell, styles.bottom, currentSquare === 'square75' ? styles.clickedSquare : null,]}><TouchableOpacity onPress={() => handleCellPress('square75')}><Text style={[styles.textcell, inCorrectCell['75'] === true ? styles.incorrectCell : null]}>{squareState['square75'] == 0 ? '                  ' : squareState['square75']}</Text></TouchableOpacity></View>
        <View style={[styles.cell, styles.right, styles.bottom, currentSquare === 'square76' ? styles.clickedSquare : null,]}><TouchableOpacity onPress={() => handleCellPress('square76')}><Text style={[styles.textcell, inCorrectCell['76'] === true ? styles.incorrectCell : null]}>{squareState['square76'] == 0 ? '                  ' : squareState['square76']}</Text></TouchableOpacity></View>
        <View style={[styles.cell, styles.bottom, currentSquare === 'square77' ? styles.clickedSquare : null,]}><TouchableOpacity onPress={() => handleCellPress('square77')}><Text style={[styles.textcell, inCorrectCell['77'] === true ? styles.incorrectCell : null]}>{squareState['square77'] == 0 ? '                  ' : squareState['square77']}</Text></TouchableOpacity></View>
        <View style={[styles.cell, styles.bottom, currentSquare === 'square78' ? styles.clickedSquare : null,]}><TouchableOpacity onPress={() => handleCellPress('square78')}><Text style={[styles.textcell, inCorrectCell['78'] === true ? styles.incorrectCell : null]}>{squareState['square78'] == 0 ? '                  ' : squareState['square78']}</Text></TouchableOpacity></View>
        <View style={[styles.cell, styles.right, styles.bottom, currentSquare === 'square79' ? styles.clickedSquare : null,]}><TouchableOpacity onPress={() => handleCellPress('square79')}><Text style={[styles.textcell, inCorrectCell['79'] === true ? styles.incorrectCell : null]}>{squareState['square79'] == 0 ? '                  ' : squareState['square79']}</Text></TouchableOpacity></View>
        {/* 6th Rank */}
        <View style={[styles.cell, styles.left, currentSquare === 'square61' ? styles.clickedSquare : null,]}><TouchableOpacity onPress={() => handleCellPress('square61')}><Text style={[styles.textcell, inCorrectCell['61'] === true ? styles.incorrectCell : null]}>{squareState['square61'] == 0 ? '                  ' : squareState['square61']}</Text></TouchableOpacity></View>
        <View style={[styles.cell, currentSquare === 'square62' ? styles.clickedSquare : null,]}><TouchableOpacity onPress={() => handleCellPress('square62')}><Text style={[styles.textcell, inCorrectCell['62'] === true ? styles.incorrectCell : null]}>{squareState['square62'] == 0 ? '                  ' : squareState['square62']}</Text></TouchableOpacity></View>
        <View style={[styles.cell, styles.right, currentSquare === 'square63' ? styles.clickedSquare : null,]}><TouchableOpacity onPress={() => handleCellPress('square63')}><Text style={[styles.textcell, inCorrectCell['63'] === true ? styles.incorrectCell : null]}>{squareState['square63'] == 0 ? '                  ' : squareState['square63']}</Text></TouchableOpacity></View>
        <View style={[styles.cell, currentSquare === 'square64' ? styles.clickedSquare : null,]}><TouchableOpacity onPress={() => handleCellPress('square64')}><Text style={[styles.textcell, inCorrectCell['64'] === true ? styles.incorrectCell : null]}>{squareState['square64'] == 0 ? '                  ' : squareState['square64']}</Text></TouchableOpacity></View>
        <View style={[styles.cell, currentSquare === 'square65' ? styles.clickedSquare : null,]}><TouchableOpacity onPress={() => handleCellPress('square65')}><Text style={[styles.textcell, inCorrectCell['65'] === true ? styles.incorrectCell : null]}>{squareState['square65'] == 0 ? '                  ' : squareState['square65']}</Text></TouchableOpacity></View>
        <View style={[styles.cell, styles.right, currentSquare === 'square66' ? styles.clickedSquare : null,]}><TouchableOpacity onPress={() => handleCellPress('square66')}><Text style={[styles.textcell, inCorrectCell['66'] === true ? styles.incorrectCell : null]}>{squareState['square66'] == 0 ? '                  ' : squareState['square66']}</Text></TouchableOpacity></View>
        <View style={[styles.cell, currentSquare === 'square67' ? styles.clickedSquare : null,]}><TouchableOpacity onPress={() => handleCellPress('square67')}><Text style={[styles.textcell, inCorrectCell['67'] === true ? styles.incorrectCell : null]}>{squareState['square67'] == 0 ? '                  ' : squareState['square67']}</Text></TouchableOpacity></View>
        <View style={[styles.cell, currentSquare === 'square68' ? styles.clickedSquare : null,]}><TouchableOpacity onPress={() => handleCellPress('square68')}><Text style={[styles.textcell, inCorrectCell['68'] === true ? styles.incorrectCell : null]}>{squareState['square68'] == 0 ? '                  ' : squareState['square68']}</Text></TouchableOpacity></View>
        <View style={[styles.cell, styles.right, currentSquare === 'square69' ? styles.clickedSquare : null,]}><TouchableOpacity onPress={() => handleCellPress('square69')}><Text style={[styles.textcell, inCorrectCell['69'] === true ? styles.incorrectCell : null]}>{squareState['square69'] == 0 ? '                  ' : squareState['square69']}</Text></TouchableOpacity></View>
        {/* 5th Rank */}
        <View style={[styles.cell, styles.left, currentSquare === 'square51' ? styles.clickedSquare : null,]}><TouchableOpacity onPress={() => handleCellPress('square51')}><Text style={[styles.textcell, inCorrectCell['51'] === true ? styles.incorrectCell : null]}>{squareState['square51'] == 0 ? '                  ' : squareState['square51']}</Text></TouchableOpacity></View>
        <View style={[styles.cell, currentSquare === 'square52' ? styles.clickedSquare : null,]}><TouchableOpacity onPress={() => handleCellPress('square52')}><Text style={[styles.textcell, inCorrectCell['52'] === true ? styles.incorrectCell : null]}>{squareState['square52'] == 0 ? '                  ' : squareState['square52']}</Text></TouchableOpacity></View>
        <View style={[styles.cell, styles.right, currentSquare === 'square53' ? styles.clickedSquare : null,]}><TouchableOpacity onPress={() => handleCellPress('square53')}><Text style={[styles.textcell, inCorrectCell['53'] === true ? styles.incorrectCell : null]}>{squareState['square53'] == 0 ? '                  ' : squareState['square53']}</Text></TouchableOpacity></View>
        <View style={[styles.cell, currentSquare === 'square54' ? styles.clickedSquare : null,]}><TouchableOpacity onPress={() => handleCellPress('square54')}><Text style={[styles.textcell, inCorrectCell['54'] === true ? styles.incorrectCell : null]}>{squareState['square54'] == 0 ? '                  ' : squareState['square54']}</Text></TouchableOpacity></View>
        <View style={[styles.cell, currentSquare === 'square55' ? styles.clickedSquare : null,]}><TouchableOpacity onPress={() => handleCellPress('square55')}><Text style={[styles.textcell, inCorrectCell['55'] === true ? styles.incorrectCell : null]}>{squareState['square55'] == 0 ? '                  ' : squareState['square55']}</Text></TouchableOpacity></View>
        <View style={[styles.cell, styles.right, currentSquare === 'square56' ? styles.clickedSquare : null,]}><TouchableOpacity onPress={() => handleCellPress('square56')}><Text style={[styles.textcell, inCorrectCell['56'] === true ? styles.incorrectCell : null]}>{squareState['square56'] == 0 ? '                  ' : squareState['square56']}</Text></TouchableOpacity></View>
        <View style={[styles.cell, currentSquare === 'square57' ? styles.clickedSquare : null,]}><TouchableOpacity onPress={() => handleCellPress('square57')}><Text style={[styles.textcell, inCorrectCell['57'] === true ? styles.incorrectCell : null]}>{squareState['square57'] == 0 ? '                  ' : squareState['square57']}</Text></TouchableOpacity></View>
        <View style={[styles.cell, currentSquare === 'square58' ? styles.clickedSquare : null,]}><TouchableOpacity onPress={() => handleCellPress('square58')}><Text style={[styles.textcell, inCorrectCell['58'] === true ? styles.incorrectCell : null]}>{squareState['square58'] == 0 ? '                  ' : squareState['square58']}</Text></TouchableOpacity></View>
        <View style={[styles.cell, styles.right, currentSquare === 'square59' ? styles.clickedSquare : null,]}><TouchableOpacity onPress={() => handleCellPress('square59')}><Text style={[styles.textcell, inCorrectCell['59'] === true ? styles.incorrectCell : null]}>{squareState['square59'] == 0 ? '                  ' : squareState['square59']}</Text></TouchableOpacity></View>
        {/* 4th Rank */}
        <View style={[styles.cell, styles.left, styles.bottom, currentSquare === 'square41' ? styles.clickedSquare : null,]}><TouchableOpacity onPress={() => handleCellPress('square41')}><Text style={[styles.textcell, inCorrectCell['41'] === true ? styles.incorrectCell : null]}>{squareState['square41'] == 0 ? '                  ' : squareState['square41']}</Text></TouchableOpacity></View>
        <View style={[styles.cell, styles.bottom, currentSquare === 'square42' ? styles.clickedSquare : null,]}><TouchableOpacity onPress={() => handleCellPress('square42')}><Text style={[styles.textcell, inCorrectCell['42'] === true ? styles.incorrectCell : null]}>{squareState['square42'] == 0 ? '                  ' : squareState['square42']}</Text></TouchableOpacity></View>
        <View style={[styles.cell, styles.right, styles.bottom, currentSquare === 'square43' ? styles.clickedSquare : null,]}><TouchableOpacity onPress={() => handleCellPress('square43')}><Text style={[styles.textcell, inCorrectCell['43'] === true ? styles.incorrectCell : null]}>{squareState['square43'] == 0 ? '                  ' : squareState['square43']}</Text></TouchableOpacity></View>
        <View style={[styles.cell, styles.bottom,currentSquare === 'square44' ? styles.clickedSquare : null,]}><TouchableOpacity onPress={() => handleCellPress('square44')}><Text style={[styles.textcell, inCorrectCell['44'] === true ? styles.incorrectCell : null]}>{squareState['square44'] == 0 ? '                  ' : squareState['square44']}</Text></TouchableOpacity></View>
        <View style={[styles.cell, styles.bottom, currentSquare === 'square45' ? styles.clickedSquare : null,]}><TouchableOpacity onPress={() => handleCellPress('square45')}><Text style={[styles.textcell, inCorrectCell['45'] === true ? styles.incorrectCell : null]}>{squareState['square45'] == 0 ? '                  ' : squareState['square45']}</Text></TouchableOpacity></View>
        <View style={[styles.cell, styles.right, styles.bottom, currentSquare === 'square46' ? styles.clickedSquare : null,]}><TouchableOpacity onPress={() => handleCellPress('square46')}><Text style={[styles.textcell, inCorrectCell['46'] === true ? styles.incorrectCell : null]}>{squareState['square46'] == 0 ? '                  ' : squareState['square46']}</Text></TouchableOpacity></View>
        <View style={[styles.cell, styles.bottom, currentSquare === 'square47' ? styles.clickedSquare : null,]}><TouchableOpacity onPress={() => handleCellPress('square47')}><Text style={[styles.textcell, inCorrectCell['47'] === true ? styles.incorrectCell : null]}>{squareState['square47'] == 0 ? '                  ' : squareState['square47']}</Text></TouchableOpacity></View>
        <View style={[styles.cell, styles.bottom, currentSquare === 'square48' ? styles.clickedSquare : null,]}><TouchableOpacity onPress={() => handleCellPress('square48')}><Text style={[styles.textcell, inCorrectCell['48'] === true ? styles.incorrectCell : null]}>{squareState['square48'] == 0 ? '                  ' : squareState['square48']}</Text></TouchableOpacity></View>
        <View style={[styles.cell, styles.right, styles.bottom, currentSquare === 'square49' ? styles.clickedSquare : null,]}><TouchableOpacity onPress={() => handleCellPress('square49')}><Text style={[styles.textcell, inCorrectCell['49'] === true ? styles.incorrectCell : null]}>{squareState['square49'] == 0 ? '                  ' : squareState['square49']}</Text></TouchableOpacity></View>
        {/* 3th Rank */}
        <View style={[styles.cell, styles.left, currentSquare === 'square31' ? styles.clickedSquare : null,]}><TouchableOpacity onPress={() => handleCellPress('square31')}><Text style={[styles.textcell, inCorrectCell['31'] === true ? styles.incorrectCell : null]}>{squareState['square31'] == 0 ? '                  ' : squareState['square31']}</Text></TouchableOpacity></View>
        <View style={[styles.cell, currentSquare === 'square32' ? styles.clickedSquare : null,]}><TouchableOpacity onPress={() => handleCellPress('square32')}><Text style={[styles.textcell, inCorrectCell['32'] === true ? styles.incorrectCell : null]}>{squareState['square32'] == 0 ? '                  ' : squareState['square32']}</Text></TouchableOpacity></View>
        <View style={[styles.cell, styles.right, currentSquare === 'square33' ? styles.clickedSquare : null,]}><TouchableOpacity onPress={() => handleCellPress('square33')}><Text style={[styles.textcell, inCorrectCell['33'] === true ? styles.incorrectCell : null]}>{squareState['square33'] == 0 ? '                  ' : squareState['square33']}</Text></TouchableOpacity></View>
        <View style={[styles.cell, currentSquare === 'square34' ? styles.clickedSquare : null,]}><TouchableOpacity onPress={() => handleCellPress('square34')}><Text style={[styles.textcell, inCorrectCell['34'] === true ? styles.incorrectCell : null]}>{squareState['square34'] == 0 ? '                  ' : squareState['square34']}</Text></TouchableOpacity></View>
        <View style={[styles.cell, currentSquare === 'square35' ? styles.clickedSquare : null,]}><TouchableOpacity onPress={() => handleCellPress('square35')}><Text style={[styles.textcell, inCorrectCell['35'] === true ? styles.incorrectCell : null]}>{squareState['square35'] == 0 ? '                  ' : squareState['square35']}</Text></TouchableOpacity></View>
        <View style={[styles.cell, styles.right,currentSquare === 'square36' ? styles.clickedSquare : null,]}><TouchableOpacity onPress={() => handleCellPress('square36')}><Text style={[styles.textcell, inCorrectCell['36'] === true ? styles.incorrectCell : null]}>{squareState['square36'] == 0 ? '                  ' : squareState['square36']}</Text></TouchableOpacity></View>
        <View style={[styles.cell, currentSquare === 'square37' ? styles.clickedSquare : null,]}><TouchableOpacity onPress={() => handleCellPress('square37')}><Text style={[styles.textcell, inCorrectCell['37'] === true ? styles.incorrectCell : null]}>{squareState['square37'] == 0 ? '                  ' : squareState['square37']}</Text></TouchableOpacity></View>
        <View style={[styles.cell, currentSquare === 'square38' ? styles.clickedSquare : null,]}><TouchableOpacity onPress={() => handleCellPress('square38')}><Text style={[styles.textcell, inCorrectCell['38'] === true ? styles.incorrectCell : null]}>{squareState['square38'] == 0 ? '                  ' : squareState['square38']}</Text></TouchableOpacity></View>
        <View style={[styles.cell, styles.right, currentSquare === 'square39' ? styles.clickedSquare : null,]}><TouchableOpacity onPress={() => handleCellPress('square39')}><Text style={[styles.textcell, inCorrectCell['39'] === true ? styles.incorrectCell : null]}>{squareState['square39'] == 0 ? '                  ' : squareState['square39']}</Text></TouchableOpacity></View>
        {/* 2th Rank */}
        <View style={[styles.cell, styles.left, currentSquare === 'square21' ? styles.clickedSquare : null,]}><TouchableOpacity onPress={() => handleCellPress('square21')}><Text style={[styles.textcell, inCorrectCell['21'] === true ? styles.incorrectCell : null]}>{squareState['square21'] == 0 ? '                  ' : squareState['square21']}</Text></TouchableOpacity></View>
        <View style={[styles.cell, currentSquare === 'square22' ? styles.clickedSquare : null,]}><TouchableOpacity onPress={() => handleCellPress('square22')}><Text style={[styles.textcell, inCorrectCell['22'] === true ? styles.incorrectCell : null]}>{squareState['square22'] == 0 ? '                  ' : squareState['square22']}</Text></TouchableOpacity></View>
        <View style={[styles.cell, styles.right, currentSquare === 'square23' ? styles.clickedSquare : null,]}><TouchableOpacity onPress={() => handleCellPress('square23')}><Text style={[styles.textcell, inCorrectCell['23'] === true ? styles.incorrectCell : null]}>{squareState['square23'] == 0 ? '                  ' : squareState['square23']}</Text></TouchableOpacity></View>
        <View style={[styles.cell, currentSquare === 'square24' ? styles.clickedSquare : null,]}><TouchableOpacity onPress={() => handleCellPress('square24')}><Text style={[styles.textcell, inCorrectCell['24'] === true ? styles.incorrectCell : null]}>{squareState['square24'] == 0 ? '                  ' : squareState['square24']}</Text></TouchableOpacity></View>
        <View style={[styles.cell, currentSquare === 'square25' ? styles.clickedSquare : null,]}><TouchableOpacity onPress={() => handleCellPress('square25')}><Text style={[styles.textcell, inCorrectCell['25'] === true ? styles.incorrectCell : null]}>{squareState['square25'] == 0 ? '                  ' : squareState['square25']}</Text></TouchableOpacity></View>
        <View style={[styles.cell, styles.right, currentSquare === 'square26' ? styles.clickedSquare : null,]}><TouchableOpacity onPress={() => handleCellPress('square26')}><Text style={[styles.textcell, inCorrectCell['26'] === true ? styles.incorrectCell : null]}>{squareState['square26'] == 0 ? '                  ' : squareState['square26']}</Text></TouchableOpacity></View>
        <View style={[styles.cell, currentSquare === 'square27' ? styles.clickedSquare : null,]}><TouchableOpacity onPress={() => handleCellPress('square27')}><Text style={[styles.textcell, inCorrectCell['27'] === true ? styles.incorrectCell : null]}>{squareState['square27'] == 0 ? '                  ' : squareState['square27']}</Text></TouchableOpacity></View>
        <View style={[styles.cell, currentSquare === 'square28' ? styles.clickedSquare : null,]}><TouchableOpacity onPress={() => handleCellPress('square28')}><Text style={[styles.textcell, inCorrectCell['28'] === true ? styles.incorrectCell : null]}>{squareState['square28'] == 0 ? '                  ' : squareState['square28']}</Text></TouchableOpacity></View>
        <View style={[styles.cell, styles.right, currentSquare === 'square29' ? styles.clickedSquare : null,]}><TouchableOpacity onPress={() => handleCellPress('square29')}><Text style={[styles.textcell, inCorrectCell['29'] === true ? styles.incorrectCell : null]}>{squareState['square29'] == 0 ? '                  ' : squareState['square29']}</Text></TouchableOpacity></View>
        {/* 1th Rank */}
        <View style={[styles.cell, styles.bottom, styles.left, currentSquare === 'square11' ? styles.clickedSquare : null,]}><TouchableOpacity onPress={() => handleCellPress('square11')}><Text style={[styles.textcell, inCorrectCell['11'] === true ? styles.incorrectCell : null]}>{squareState['square11'] == 0 ? '                  ' : squareState['square11']}</Text></TouchableOpacity></View>
        <View style={[styles.cell, styles.bottom, currentSquare === 'square12' ? styles.clickedSquare : null,]}><TouchableOpacity onPress={() => handleCellPress('square12')}><Text style={[styles.textcell, inCorrectCell['12'] === true ? styles.incorrectCell : null]}>{squareState['square12'] == 0 ? '                  ' : squareState['square12']}</Text></TouchableOpacity></View>
        <View style={[styles.cell, styles.bottom, styles.right, currentSquare === 'square13' ? styles.clickedSquare : null,]}><TouchableOpacity onPress={() => handleCellPress('square13')}><Text style={[styles.textcell, inCorrectCell['13'] === true ? styles.incorrectCell : null]}>{squareState['square13'] == 0 ? '                  ' : squareState['square13']}</Text></TouchableOpacity></View>
        <View style={[styles.cell, styles.bottom, currentSquare === 'square14' ? styles.clickedSquare : null,]}><TouchableOpacity onPress={() => handleCellPress('square14')}><Text style={[styles.textcell, inCorrectCell['14'] === true ? styles.incorrectCell : null]}>{squareState['square14'] == 0 ? '                  ' : squareState['square14']}</Text></TouchableOpacity></View>
        <View style={[styles.cell, styles.bottom, currentSquare === 'square15' ? styles.clickedSquare : null,]}><TouchableOpacity onPress={() => handleCellPress('square15')}><Text style={[styles.textcell, inCorrectCell['15'] === true ? styles.incorrectCell : null]}>{squareState['square15'] == 0 ? '                  ' : squareState['square15']}</Text></TouchableOpacity></View>
        <View style={[styles.cell, styles.bottom, styles.right, currentSquare === 'square16' ? styles.clickedSquare : null,]}><TouchableOpacity onPress={() => handleCellPress('square16')}><Text style={[styles.textcell, inCorrectCell['16'] === true ? styles.incorrectCell : null]}>{squareState['square16'] == 0 ? '                  ' : squareState['square16']}</Text></TouchableOpacity></View>
        <View style={[styles.cell, styles.bottom, currentSquare === 'square17' ? styles.clickedSquare : null,]}><TouchableOpacity onPress={() => handleCellPress('square17')}><Text style={[styles.textcell, inCorrectCell['17'] === true ? styles.incorrectCell : null]}>{squareState['square17'] == 0 ? '                  ' : squareState['square17']}</Text></TouchableOpacity></View>
        <View style={[styles.cell, styles.bottom, currentSquare === 'square18' ? styles.clickedSquare : null,]}><TouchableOpacity onPress={() => handleCellPress('square18')}><Text style={[styles.textcell, inCorrectCell['18'] === true ? styles.incorrectCell : null]}>{squareState['square18'] == 0 ? '                  ' : squareState['square18']}</Text></TouchableOpacity></View>
        <View style={[styles.cell, styles.bottom, styles.right, currentSquare === 'square19' ? styles.clickedSquare : null,]}><TouchableOpacity onPress={() => handleCellPress('square19')}><Text style={[styles.textcell, inCorrectCell['19'] === true ? styles.incorrectCell : null]}>{squareState['square19'] == 0 ? '                  ' : squareState['square19']}</Text></TouchableOpacity></View>

      </View>
      <View style={styles.buttonContainer}>
        <View style={{flexDirection: 'column',}}>
        <View  style={{flexDirection: 'row', justifyContent:'space-around', marginBottom: 10}}>
          {/* <Text>Mistake</Text> */}
          <Text id="mistakes">Mistake:       {mistake}/3</Text>
          {/* <Text>Hints:</Text> */}
          <Text id="hint">Hints:      {hint}/3</Text>
        </View>
          <View style={{flexDirection: 'row', justifyContent:'space-around'}}>
            <TouchableOpacity activeOpacity={0.5} style={styles.eraseButton} onPress={() => handleErase()}><Text>Erase</Text></TouchableOpacity>
            <TouchableOpacity activeOpacity={0.5}  style={[styles.eraseButton]} onPress={() => handleHint()}><Text >Hint</Text></TouchableOpacity>
          </View>
        </View>
        <View style={[styles.numbers]}>
          <TouchableOpacity activeOpacity={0.5} style={[ styles.stackcontainer]} onPress={() => handleClickNumber("1")}><View style={[styles.stackcell]}><Text style={[styles.textstackcell]}>1</Text></View></TouchableOpacity>
          <TouchableOpacity activeOpacity={0.5} style={[styles.number, styles.stackcontainer]} onPress={() => handleClickNumber("2")}><View style={[styles.stackcell]}><Text style={[styles.textstackcell]}>2</Text></View></TouchableOpacity>
          <TouchableOpacity activeOpacity={0.5} style={[styles.number, styles.stackcontainer]} onPress={() => handleClickNumber("3")}><View style={[styles.stackcell]}><Text style={[styles.textstackcell]}>3</Text></View></TouchableOpacity>
          <TouchableOpacity activeOpacity={0.5} style={[styles.number, styles.stackcontainer]} onPress={() => handleClickNumber("4")}><View style={[styles.stackcell]}><Text style={[styles.textstackcell]}>4</Text></View></TouchableOpacity>
          <TouchableOpacity activeOpacity={0.5} style={[styles.number, styles.stackcontainer]} onPress={() => handleClickNumber("5")}><View style={[styles.stackcell]}><Text style={[styles.textstackcell]}>5</Text></View></TouchableOpacity>
          <TouchableOpacity activeOpacity={0.5} style={[styles.number, styles.stackcontainer]} onPress={() => handleClickNumber("6")}><View style={[styles.stackcell]}><Text style={[styles.textstackcell]}>6</Text></View></TouchableOpacity>
          <TouchableOpacity activeOpacity={0.5} style={[styles.number, styles.stackcontainer]} onPress={() => handleClickNumber("7")}><View style={[styles.stackcell]}><Text style={[styles.textstackcell]}>7</Text></View></TouchableOpacity>
          <TouchableOpacity activeOpacity={0.5} style={[styles.number, styles.stackcontainer]} onPress={() => handleClickNumber("8")}><View style={[styles.stackcell]}><Text style={[styles.textstackcell]}>8</Text></View></TouchableOpacity>
          <TouchableOpacity activeOpacity={0.5} style={[styles.number, styles.stackcontainer]} onPress={() => handleClickNumber("9")}><View style={[styles.stackcell]}><Text style={[styles.textstackcell]}>9</Text></View></TouchableOpacity>
          <CongratulationsModal visible={visibleWin} onRequestClose={handRequestCloseWin} elapsed={formatTime(Math.floor(elapsedTime/1000))}></CongratulationsModal>
          <GameOver visible={visibleGameOver} onRequestClose={handleRequestCloseGameover} onPlayAgain={handlePlayAgain}></GameOver>
        </View>
        </View>
        <View>
        <View style={styles.sovleContiner}>
          <TouchableOpacity activeOpacity={0.8} style={[styles.solveButton, {}]} onPress={() => handleNewGame()} ><Text style={[styles.textButton]}>New Game</Text></TouchableOpacity>
          <TouchableOpacity activeOpacity={0.8} style={styles.solveButton} onPress={() => handleSolve()} ><Text style={[styles.textButton]}>Solve</Text></TouchableOpacity>
          <TouchableOpacity activeOpacity={0.8} style={styles.solveButton} onPress={() => pressDifficaltily()}>
          
            <Text style={[styles.textButton]}>Difficaltily</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      <View style={styles.alert}></View>
    </ScrollView>
    {difficaltily && (difficaltilyContainer())}
  </View>
  );
};




const styles = StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      width: '100%',
      minHeight: '100%', // Đảm bảo container có đủ chiều cao để chứa nội dung
      backgroundColor: 'white',
      flexDirection: 'column',
    },
  gameBoard: {
    width: '100%',
    height: '50%',
    display: 'flex',
    flexWrap: 'wrap',
    borderWidth: 10,
    borderColor: 'transparent',
    flexDirection: 'row',
    alignContent: 'center',
  },
  square: {
    width: '11%',
    height: '11.11%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    borderWidth: 1,
    borderStyle: 'solid',
    // borderColor: 'rgb(202, 199, 199)',
    // cursor: 'pointer',
    fontSize: 30,
    fontFamily: 'HelveticaNeue',
    backgroundColor:'#FFFFE0'
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
  
  active: {
    backgroundColor: 'lightblue',
  },
  top: {
    borderTopWidth: 5,
    borderTopColor: 'rgb(0, 0, 0)',
  },
  bottom: {
    borderBottomWidth: 5,
    borderBottomColor: 'black',
  },
  left: {
    borderLeftWidth: 5,
    borderLeftColor: 'rgb(0, 0, 0)',
  },
  right: {
    borderRightWidth: 5,
    borderRightColor: 'rgb(0, 0, 0)',
  },
  filled: {
    color: 'black',
  },
  false: {
    color: 'darkred',
  },
  true: {
    color: 'green',
  },
  buttonContainer: {
    display: 'flex',
    // flexDirection: 'row',
    height: '30%',
    flexDirection: 'column'
  },
  solveButton: {
    width: '33%',
    height: 50,
    marginVertical: 2,
    // backgroundColor: '#0072e3',
    backgroundColor: '#5F9EA0',
    fontSize: 18,
    borderRadius: 5,
    textAlign: 'center',
    justifyContent: 'center',
    alignItems: 'center',
  },
  timeRankButton:{
    width: 30,
    height: 30,
    // backgroundColor: '#0072e3',
    backgroundColor: '#5F9EA0',
    fontSize: 18,
    borderRadius: 5,
    textAlign: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    // cursor: 'pointer',
  },
  textButton:{
    fontSize: 18,
    fontWeight: "700",
    color: 'white',
    fontFamily: 'HelveticaNeue',
  },
  textcell: {
    color: '#333',
    fontSize: 18,
    fontFamily: 'HelveticaNeue',
  },
  eraseButton: {
    width: 45,
    height: 45,
    borderRadius: 50,
    borderWidth: 1,
    color: '#0072e3',
    // backgroundColor: 'rgb(227, 233, 246)',
    backgroundColor: 'moccasin',
    borderColor: 'orange',
    fontSize: 10,
    // cursor: 'pointer',
    marginVertical: 2,
    justifyContent:'center',
    alignItems:'center',
  },
  hintButton: {
    width: 45,
    height: 45,
    borderRadius: 50,
    borderWidth: 0,
    color: '#0072e3',
    backgroundColor: 'rgb(227, 233, 246)',
    fontSize: 10,
    // cursor: 'pointer',
    marginVertical: 2,
  },
  numbers: {
    // borderWidth: 1,
    width: '90%',
    height: '40%',
    display: 'flex',
    flexWrap: 'nowrap',
    justifyContent:'space-evenly',
    alignItems:'center',
    flexDirection: 'row',
  },
  number: {
    // width: '28%', // Giảm chiều rộng của nút số
    // height: '33%', // Giảm chiều cao của nút số
    // backgroundColor: 'rgb(227, 233, 246)',
    // alignItems: 'center',
    // justifyContent: 'center', // Căn giữa nội dung
    // position: 'relative',
    // // cursor: 'pointer',
    // fontSize: 20, // Giảm kích thước chữ
    // color: '#0072e3',
    // borderWidth: 1, // Thêm viền
    // borderColor: '#ccc', // Màu viền
    // borderRadius: 5,
    // marginVertical: 2, // Thêm khoảng cách giữa các nút số
    // marginHorizontal: '1%', // Căn lề giữa các nút số
    // fontFamily: 'HelveticaNeue',
  },
  incorrectCell:{
    color: '#FF001C',
  },
  sovleContiner:{
    flexDirection: 'row',
    justifyContent:'space-between'
  }, 
  alert: {
    position: 'relative',
    transform: [{ translateX: -0.4 * 1000 }, { translateY: -0.5 * 1000 }],
    textAlign: 'center',
    alignContent: 'center',
    justifyContent: 'center',
    fontSize: 10,
    fontWeight: 'bold',
    zIndex: 1000,
    display: 'none',
  },
  clickedSquare: {
    // backgroundColor: '#3AD1EB', // Example color change
    backgroundColor: 'peru', // Example color change
  },
  stackcontainer: {
    // position: 'absolute',
    // justifyContent: 'space-between',
    width: CellSize -10,
    height: CellSize -10,
    margin: 9,
  },
  stackcell: {
    width: CellSize -5,
    height: CellSize + 5,
    backgroundColor: 'moccasin',
    borderColor: 'orange',
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: BorderWidth,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textstackcell: {
    color: '#666',
    fontSize: CellSize * 3 / 6,
    fontFamily: 'HelveticaNeue',
  },
  textTimer: {
    fontSize: 23,
    fontWeight: '200',
    fontFamily: 'Menlo',
  },
  warningTimer:{
    color: 'red',
    fontWeight: 'bold',
  },
  notWarningTimer:{
    color: 'black',
  },
  imageRank:{
    width: 20,
    height: 20,
  }
});


export default App;
