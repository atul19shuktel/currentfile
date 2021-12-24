import React, { Component } from "react";
import {
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Text,
  ImageBackground,
  Image,
  Alert
} from "react-native";
import * as Permissions from "expo-permissions";
import { BarCodeScanner } from "expo-barcode-scanner";
import db from '../config.js'
import firebase from 'firebase'

const bgImage = require("../assets/background2.png");
const appIcon = require("../assets/appIcon.png");
const appName = require("../assets/appName.png");

export default class TransactionScreen extends Component {
  constructor(props) {
    super(props); 
    this.state = {
      bookID: "",
      studentId: "",
      domState: "normal",
      hasCameraPermissions: null,
      scanned: false,
      bookName:'',
      studentName:'', 
    };
  }

  getCameraPermissions = async domState => {
    const { status } = await Permissions.askAsync(Permissions.CAMERA);

    this.setState({
      /*status === "granted" is true when user has granted permission
          status === "granted" is false when user has not granted the permission
        */
      hasCameraPermissions: status === "granted",
      domState: domState,
      scanned: false,
      bookName:'',
      studentName:'',

    });
  };

  handleTransaction =async()=>{
    const{bookID,studentId}=this.state

    await this.getBookDetails(bookID)
    await this.getStudentDetails(studentId)
    
    var transactionType = await this.checkBookAvailiblity(bookID)
    if(!transactionType ){
      this.setState({'bookID':'','studentId':''})
      alert('book doesnt exist in our libary') 
    }else if(transactionType === 'issue'){
      this.bookIssue()
     }else if(transactionType ==='return'){
       this.returnBook()
     }
    
   
   /*   
    db.collection('books').doc(bookID).get()
    .then((doc)=>{
      var book = doc.data();
      
      if(book.availiblity === true ){
        this.bookIssue()
      }else{
        this.returnBook()
      }
     
    })*/

    //db.collection('students').doc(this.state.studentId).get().then((doc)=>{
     // console.log(doc.data())
    //})
  }

  handleBarCodeScanned = async ({ type, data }) => {
    const { domState } = this.state;

    if (domState === "bookID") {
      this.setState({
        bookID: data,
        domState: "normal",
        scanned: true
      });
    } else if (domState === "studentId") {
      this.setState({
        studentId: data,
        domState: "normal",
        scanned: true
      });
    }
  };

  getBookDetails=async bookID=>{
    db.collection('books').doc(bookID).get().then((doc)=>{
      var bookName =doc.data();
      this.setState({'bookName':bookName.name})
    })
  }
  getStudentDetails=async studentId=>{
    db.collection('students').doc(studentId).get().then((doc)=>{
      var studentName =doc.data();
      this.setState({'studentName':studentName.name})
    })
  }

  bookIssue=async ()=>{
    alert('succesfullt issuesdsdsdsd book')
    const{studentName,bookName,bookID,studentId}=this.state
    //creating a transaction in collection.................
    
    db.collection('transactions').add({
      'Book name':bookName,
      'Student name':studentName,
      'book id':bookID,
      'student id':studentId,
      'transaction type':'issue',
      'd a t e':firebase.firestore.Timestamp.now().toDate(),
    })
    //changing book status..........
    db.collection('books').doc(bookID).update({
      'availiblity':false,
    })
    //student modifier............
    db.collection('students').doc(studentId).update({
      'bookIssued':firebase.firestore.FieldValue.increment(1),
    })
    
  }
  checkBookAvailiblity=async(bookID)=>{
    console.log('aaaaaaaaaaaaaaaaaaaaa  ')
    const transactionType=''
    const bookref = await db.collection('books').where("bookId",'==',bookID)
    .get()
    if(bookref.docs.length == 0){
      transactionType = false
    }else{
      bookref.docs.map(doc=>{
        transactionType = doc.data().availiblity ? 'issue' : 'return'
      })
    }
   
    return transactionType

  }
  

  returnBook=()=>{
    const{studentName,bookName,bookID,studentId}=this.state
    alert('apparently,someone took it and didnt return')
    db.collection('transactions').add({
      'Book name':bookName,
      'Student name':studentName,
      'book id':bookID,
      'student id':studentId,
      'transaction type':'return',
      'd a t e':firebase.firestore.Timestamp.now().toDate(),
    })
    //changing book status..........
    db.collection('books').doc(bookID).update({
      'availiblity':true,
    })
    //student modifier............
    db.collection('students').doc(studentId).update({
      'bookIssued':firebase.firestore.FieldValue.increment(-1),
    })
  }
  render() {
    const { bookId, studentId, domState, scanned } = this.state;
    if (domState !== "normal") {
      return (
        <BarCodeScanner
          onBarCodeScanned={scanned ? undefined : this.handleBarCodeScanned}
          style={StyleSheet.absoluteFillObject}
        />
      );
    }
    return (
      <View style={styles.container}>
        <ImageBackground source={bgImage} style={styles.bgImage}>
          <View style={styles.upperContainer}>
            <Image source={appIcon} style={styles.appIcon} />
            <Image source={appName} style={styles.appName} />
          </View>
          <View style={styles.lowerContainer}>
            <View style={styles.textinputContainer}>
              <TextInput
                style={styles.textinput}
                placeholder={"Book Id"}
                placeholderTextColor={"#FFFFFF"}
                onChangeText={(text)=>{this.setState({bookID:text})}}
                value={bookId}
              />
              <TouchableOpacity
                style={styles.scanbutton}
                onPress={() => this.getCameraPermissions("bookID")}
              >
                <Text style={styles.scanbuttonText}>Scan</Text>
              </TouchableOpacity>
            </View>
            <View style={[styles.textinputContainer, { marginTop: 25 }]}>
              <TextInput
                style={styles.textinput}
                placeholder={"Student Id"}
                placeholderTextColor={"#FFFFFF"}
                onChangeText={(tect)=>{this.setState({studentId:tect})}}
                value={studentId}
              />
              <TouchableOpacity
                style={styles.scanbutton}
                onPress={() => this.getCameraPermissions("studentId")}
              >
                <Text style={styles.scanbuttonText}>Scan</Text>
              </TouchableOpacity>             
            </View>
            <TouchableOpacity 
            onPress={this.handleTransaction}
             style={styles.submitButton}><Text>submit</Text></TouchableOpacity>
          </View>
        </ImageBackground>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF"
  },
  bgImage: {
    flex: 1,
    resizeMode: "cover",
    justifyContent: "center"
  },
  upperContainer: {
    flex: 0.5,
    justifyContent: "center",
    alignItems: "center"
  },
  appIcon: {
    width: 200,
    height: 200,
    resizeMode: "contain",
    marginTop: 80
  },
  appName: {
    width: 80,
    height: 80,
    resizeMode: "contain"
  },
  lowerContainer: {
    flex: 0.5,
    alignItems: "center"
  },
  textinputContainer: {
    borderWidth: 2,
    borderRadius: 10,
    flexDirection: "row",
    backgroundColor: "#9DFD24",
    borderColor: "#FFFFFF"
  },
  textinput: {
    width: "57%",
    height: 50,
    padding: 10,
    borderColor: "#FFFFFF",
    borderRadius: 10,
    borderWidth: 3,
    fontSize: 18,
    backgroundColor: "#5653D4",
    fontFamily: "Rajdhani_600SemiBold",
    color: "#FFFFFF"
  },
  scanbutton: {
    width: 100,
    height: 50,
    backgroundColor: "#9DFD24",
    borderTopRightRadius: 10,
    borderBottomRightRadius: 10,
    justifyContent: "center",
    alignItems: "center"
  },
  scanbuttonText: {
    fontSize: 24,
    color: "#0A0101",
    fontFamily: "Rajdhani_600SemiBold"
  },
  submitButton :{ width: "33%", height: 55, justifyContent: "center", alignItems: "center", borderWidth:4, borderColor:"#F48D20", borderRadius: 20, marginTop:20, backgroundColor:"green"}
  
});
