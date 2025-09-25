import "../styles/Sidebar.css";
import { useContext, useEffect } from "react";
import { MyContext } from "../contexts/MyContext.jsx";
import { AuthContext } from "../contexts/AuthContext.jsx";
import {v1 as uuidv1} from "uuid";
import api from "../api.js";

function Sidebar() {
    const { allThreads, setAllThreads, currThreadId, setNewChat, setPrompt, setReply, setCurrThreadId, setPrevChats } = useContext(MyContext);
    const { token, user } = useContext(AuthContext);

    const getAllThreads = async () => {
        if(!user){
            setAllThreads([]);
            return;
        }
        try {
            const response = await api.get("/thread", {
                headers: { Authorization: `Bearer ${token}` }
            });
        
            const data = response.data;
        
            if (!response.status || response.status >= 400) {
                console.log("Error fetching threads:", data.error);
                return;
            }
        
            setAllThreads(data.map(thread => ({ threadId: thread.threadId, title: thread.title })));
        } catch(err) {
            console.log(err);
        }
    };

    useEffect(() => {
        getAllThreads();
    }, [currThreadId, user]);

    const createNewChat = () => {
        setNewChat(true);
        setPrompt("");
        setReply(null);
        setCurrThreadId(uuidv1());
        setPrevChats([]);
    };

    const changeThread = async (newThreadId) => {
        setCurrThreadId(newThreadId);
        try {
            const response = await api.get(`/thread/${newThreadId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
        
            const res = response.data;
            setPrevChats(res);
            setNewChat(false);
        } catch (err) {
            console.log(err);
        }
         
    };

    const deleteThread = async (threadId) => {
        try {
            const response = await api.delete(`/thread/${threadId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
        
            const res = response.data;
            setAllThreads(prev => prev.filter(thread => thread.threadId !== threadId));
            if (threadId === currThreadId) createNewChat();
        } catch (err) {
            console.log(err);
        }
        
    };

    return (
        <section className="sidebar">
            <button onClick={createNewChat}>
                <img src="src/assets/blacklogo.png" alt="gpt logo" className="logo" />
                <span><i className="fa-solid fa-pen-to-square"></i></span>
            </button>
            
            <ul className="history">
                {allThreads?.map((thread, idx) => (
                    <li key={idx} 
                        onClick={() => changeThread(thread.threadId)}
                        className={thread.threadId === currThreadId ? "highlighted": ""}
                    >
                        {thread.title}
                        <i className="fa-solid fa-trash"
                            onClick={(e) => {
                                e.stopPropagation();
                                deleteThread(thread.threadId);
                            }}
                        ></i>
                    </li>
                ))}
            </ul>
            <div className="sign">
                <p>By JyothiKaku &hearts;</p>
            </div>
        </section>
    )
}

export default Sidebar;
