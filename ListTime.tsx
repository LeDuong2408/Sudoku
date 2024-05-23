import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, Modal,FlatList,TouchableWithoutFeedback } from 'react-native';
import {   app,database }  from './Firebase/firebase';
import { ref, push, set, query, orderByChild, limitToFirst, get,remove, DataSnapshot,DatabaseReference,getDatabase  } from "firebase/database";
import { CellSize, BoardWidth, BorderWidth, Color, BoardHeight } from './components/GlobalStyle';


let Height = 300
const GameOver = ({ visible,handleCloseTimeRank}:any) => {
    const [timeDifficulty1, setTime1] = useState(false);
    const [timeDifficulty2, setTime2]  = useState(false);
    const [timeDifficulty3,  setTime3]  = useState(false);
    const db = getDatabase(app);
    const [elapsedValues, setElapsedValues] = useState<any[]>([]);
    

    // useEffect(() => {
    //     setElapsedValues(getElapsedValues('easy'))
    // },[]);
    const hanleSetElapsedValues = (diff:any) =>{
        getElapsedValues(diff)
      .then((values:any) => {
        // Sắp xếp mảng theo thứ tự tăng dần của giá trị elapsed
        values.sort((a:any, b:any) => a.elapsed - b.elapsed);
    
        // Chỉ lấy 5 giá trị nhỏ nhất
        const smallestValues = values.slice(0, 5);
        Height = (smallestValues.length)*60
        // Set giá trị elapsedValues với 5 giá trị nhỏ nhất
        setElapsedValues(smallestValues);
      })
      .catch((error:any) => {
        console.error("Đã xảy ra lỗi khi lấy dữ liệu:", error);
      });
      }
    
    useEffect(() => {
        if (timeDifficulty1 == true)
            hanleSetElapsedValues('easy')
        else if (timeDifficulty2 == true)
            hanleSetElapsedValues('medium')
        else if (timeDifficulty3 == true)
            hanleSetElapsedValues('hard')

    },[timeDifficulty1,timeDifficulty2,timeDifficulty3]);
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
      
      function formatTime(elapsed: number): string {
        const hour = Math.floor(elapsed / 60 / 60);
        const minute = Math.floor(elapsed / 60 - hour * 60);
        const second = elapsed % 60;
        return [ minute, second].map(x => x < 10 ? '0' + x : x).join(':');
      }


    const handleSetDifficul = (number: any) => {
        if (number == 1){
            if(timeDifficulty1 == false){
            setTime1(true);
            setTime2(false);
            setTime3(false);
            }
            else{
                setTime1(false);
            }
        }
        else if (number == 2){
            if(timeDifficulty2 == false){
                setTime1(false);
                setTime2(true);
                setTime3(false);
                }
                else{
                    setTime2(false);
                }
        }
        else if (number == 3){
            if(timeDifficulty3 == false){
                setTime1(false);
                setTime2(false);
                setTime3(true);
                }
                else{
                    setTime3(false);
                }
        }
    }
    const resetSelect= () => {
        handleCloseTimeRank();
        setTime1(false);
        setTime2(false);
        setTime3(false);
    }
    


  return (

    <Modal
      transparent={true}   
      animationType="slide"
      visible={visible}
    >
<TouchableWithoutFeedback onPress={resetSelect}> 
<View style={styles.container}>
<Text style={styles.buttonText}>SUDOKU RANKING BOARD</Text>
    <TouchableOpacity style={styles.button} onPress={() => { handleSetDifficul(1) }}>
        <Text style={styles.buttonText}>Easy</Text>
    </TouchableOpacity>
    {timeDifficulty1 && (
        <View style={styles.timesContainer}>
            <FlatList
                data={elapsedValues}
                renderItem={({ item, index }) => (
                    <View style={styles.timeItem}>
                        <Text style={styles.timeText}>{index + 1}. {formatTime(Math.floor(item.elapsed/1000))}</Text>
                    </View>
                )}
                keyExtractor={(item, index) => index.toString()}
            />
        </View>
    )}

    <TouchableOpacity style={styles.button} onPress={() => { handleSetDifficul(2) }}>
        <Text style={styles.buttonText}>Medium</Text>
    </TouchableOpacity>
    {timeDifficulty2 && (
        <View style={styles.timesContainer}>
             <FlatList
                data={elapsedValues}
                renderItem={({ item, index }) => (
                    <View style={styles.timeItem}>
                        <Text style={styles.timeText}>{index + 1}. {formatTime(Math.floor(item.elapsed/1000))}</Text>
                    </View>
                )}
                keyExtractor={(item, index) => index.toString()}
            />
        </View>
    )}

    <TouchableOpacity style={styles.button} onPress={() => { handleSetDifficul(3) }}>
        <Text style={styles.buttonText}>Hard</Text>
    </TouchableOpacity>
    {timeDifficulty3 && (
        <View style={styles.timesContainer}>
             <FlatList
                data={elapsedValues}
                renderItem={({ item, index }) => (
                    <View style={styles.timeItem}>
                        <Text style={styles.timeText}>{index + 1}. {formatTime(Math.floor(item.elapsed/1000))}</Text>
                    </View>
                )}
                keyExtractor={(item, index) => index.toString()}
            />
        </View>
    )}
    <TouchableOpacity style={styles.button} onPress ={() => {resetSelect() }}>
        {/* <Text style={styles.buttonTextClose}>X</Text> */}
        <Image source={require('./image/close.png')} style={styles.iconClose}></Image>
    </TouchableOpacity>
</View>
</TouchableWithoutFeedback>

    </Modal>
    
  );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        width: '100%',
        height: 500,
        borderColor: 'black',
        borderWidth: 1,
    },
    button: {
        width: 250,
        height: 50,
        paddingVertical: 10,
        paddingHorizontal: 20,
        backgroundColor: '#5F9EA0',
        fontSize: 18,
        borderRadius: 5,
        margin: 10,
    },
    buttonText: {
        textAlign: 'center',
        color: 'white',
        fontSize: 18,
        fontWeight: "700",
        fontFamily: 'HelveticaNeue',
    },
    iconClose: {
        width: 15,
        height: 15,
        alignItems:'center',
        justifyContent: 'flex-start',
        textAlign: 'center',
        marginLeft: 100,
        marginTop: 10
    },
    timesContainer: {
        // marginTop: 20,
        flex:2,
        justifyContent:'space-between',
        alignItems: 'center',
        maxHeight: Height,
    },
    timeItem: {
        width: 250,
        height: 50,
        backgroundColor: '#F0F0F0',
        padding: 10,
        borderRadius: 5,
        marginVertical: 5,
    },
    timeText: {
        fontSize: 20,
        textAlign: 'center',
    },
    
});

export default GameOver;
