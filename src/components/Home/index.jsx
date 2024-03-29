import './index.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faThumbsUp, faComment, faShare } from '@fortawesome/free-solid-svg-icons'
import React, { useEffect, useState } from "react";
import { initializeApp } from "firebase/app";

import {
  getFirestore, collection,
  addDoc, getDocs, doc,
  onSnapshot, query, serverTimestamp,
  orderBy, deleteDoc, updateDoc

} from "firebase/firestore";
import moment from 'moment';



const firebaseConfig = {
  apiKey: "AIzaSyDksfrxx2XOm4XRu_xLmSrDLmwu7rLMohg",
  authDomain: "posting-app-c48c2.firebaseapp.com",
  projectId: "posting-app-c48c2",
  storageBucket: "posting-app-c48c2.appspot.com",
  messagingSenderId: "41415182194",
  appId: "1:41415182194:web:ccb37e190ceb2e88f7ffeb"
};
// Initialize Firebase
const app = initializeApp(firebaseConfig);


// Initialize Cloud Firestore and get a reference to the service
const db = getFirestore(app);






function Home() {
    const [postText, setPostText] = useState("");
    const  [posts, setPosts] = useState([]);
    const [editing, setEditing] = useState({
      editingId: null,
      editingText: "",
      editingfile: "",
    });

  
    useEffect(() => {


        const getData = async () => {
          const querySnapshot = await getDocs(collection(db, "posts"));
    
          querySnapshot.forEach((doc) => {
            console.log(`${doc.id} => `, doc.data());
    
            setPosts((prev) => {
              let newArray = [...prev, doc.data()];
              return newArray
            });
    
          });
        }
        // getData();
    
        let unsubscribe = null;
        const getRealtimeData = async () => {
    
          const q = query(collection(db, "posts"), orderBy("createdOn", "desc"));
    
          unsubscribe = onSnapshot(q, (querySnapshot) => {
            const posts = [];
    
            querySnapshot.forEach((doc) => {
              // posts.unshift(doc.data());
              // posts.push(doc.data());
    
              posts.push({ id: doc.id, ...doc.data() });
    
            });
    
            setPosts(posts);
            console.log("posts: ", posts);
          });
    
        }
        getRealtimeData();
    
        return () => {
          console.log("Cleanup function");
          unsubscribe();
        }
    
      }, [])
    
   

     
     const savePost = async (e) => {
        e.preventDefault();
    
        console.log("postText: ", postText);
    
        try {
    
          const docRef = await addDoc(collection(db, "posts"), {
            text: postText,
            createdOn: serverTimestamp(),
          });
          console.log("Document written with ID: ", docRef.id);
    
        } catch (e) {
          console.error("Error adding document: ", e);
        }
    }
     
       // DeletePost
       const deletePost = async (postId) => {

        console.log("postId: ", postId);
    
        await deleteDoc(doc(db, "posts", postId));
    
      }

      // UpdatePost
      const updatePost = async (e) => {
        e.preventDefault();
        // console.log(Editing.editingfile);
        await updateDoc(doc(db, "posts", editing.editingId), {
          text: editing.editingText,
         
        }); 
        setEditing({
          editingId: null,
          editingText: "",
         
        });
      };


    
    return (
        <div className="postDiv"> 
      <div className="postHeader">
          <h1>Posting App</h1>

          <form onSubmit={savePost}>
        <textarea
          type="text"
          className='input'
          placeholder="What's in your mind..."
          onChange={(e) => {
            setPostText(e.target.value)
          }}
        />
        <br />
        <button type="submit">Post</button>
      </form>

      </div>
   
        {posts.map((eachPost, i) => (
          <div className="post" key={i}>

            <h3> 
             {(eachPost.id === editing.editingId) ? 
              <form  onSubmit={updatePost}>
                 <input type="text"
              value={editing.editingText}
              onChange={(e) => {
                setEditing({
                  ...editing,
                  editingText: e.target.value
                })
              }}
              placeholder="please enter updated value" />

            <button type="submit">Update</button>
              
               
              </form>
              :
               eachPost?.text
             }
            
        
            </h3>
          <br />

        <span className='time'>   {
          moment(
            (eachPost?.createdOn?.seconds) ?
            eachPost?.createdOn?.seconds
            * 1000
            :
            undefined
            )
            .fromNow()
            // .format ('Do MMMM, h:mm a ')
}  
           </span>
           <button onClick={() => { deletePost(eachPost?.id) }}>Delete</button>
           
           {(editing.editingId === eachPost?.id) ? null :
              <button onClick={() => {

                setEditing({
                  editingId: eachPost?.id,
                  editingText: eachPost?.text
                })

              }} >Edit</button>
            }
            </div>


        ))}


{/* <div className='postFooter'>
        <div> <FontAwesomeIcon icon={faThumbsUp} /> like </div>
        <div> <FontAwesomeIcon icon={faComment} /> comment</div>
        <div> <FontAwesomeIcon icon={faShare} /> share</div>
      </div>   */}
            </div> 
       
      );
         
}
   
export default Home;