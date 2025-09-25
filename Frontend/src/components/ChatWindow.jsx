import "../styles/ChatWindow.css";
import Chat from "../components/Chat.jsx";
import { MyContext } from "../contexts/MyContext.jsx";
import { AuthContext } from "../contexts/AuthContext.jsx";
import { useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ScaleLoader } from "react-spinners";
import api from "../api.js";

function ChatWindow() {
    const { prompt, setPrompt, reply, setReply, currThreadId, setPrevChats, setNewChat } = useContext(MyContext);
    const { user, token, logout } = useContext(AuthContext);
    const [loading, setLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const navigate = useNavigate();

    const getReply = async () => {
        if(!prompt) return;
        setLoading(true);
        setNewChat(false);

        try {
            const res = await api.post("/chat", { message: prompt, threadId: currThreadId }, {
                headers: user ? { Authorization: `Bearer ${token}` } : {}
            });
    
            // Axios puts the server response in res.data
            setReply(res.data.reply);
        } catch(err) {
            console.log(err);
        }
        setLoading(false);
    };

    // Append new chat to prevChats
    useEffect(() => {
        if(prompt && reply) {
            setPrevChats(prevChats => [
                ...prevChats,
                { role: "user", content: prompt },
                { role: "assistant", content: reply }
            ]);
        }
        setPrompt("");
    }, [reply]);

    const handleProfileClick = () => setIsOpen(!isOpen);

    // UI for free users (not logged in)
    if(!user) {
        return (
            <div className="chatWindow loggedOut">
                <div className="navbar">
                   <span> AuroraAI <i className="fa-solid fa-chevron-down"></i></span>
                   <div className="authButtons">
                      <button onClick={() => navigate("/login")}>Login</button>
                      <button onClick={() => navigate("/register")}>Register</button>
                   </div>
                </div>
                
                <Chat />
                <ScaleLoader color="#fff" loading={loading} />
                <div className="chatInput">
                    <div className="inputBox">
                        <input
                            placeholder="Ask anything"
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' ? getReply() : null}
                        />
                        <div id="submit" onClick={getReply}><i className="fa-solid fa-paper-plane"></i></div>
                    </div>
                </div>
                
                <p className="info">Register/login to save your chats and access more features.</p>
                
            </div>
        );
    }

    // UI for logged-in users
    return (
        <div className="chatWindow">
            <div className="navbar">
                <span> AuroraAI <i className="fa-solid fa-chevron-down"></i></span>

                <div className="userIconDiv" onClick={handleProfileClick}>
                    <span className="userIcon"><i className="fa-solid fa-user"></i></span>
                </div>

                {isOpen &&
                    <div className="dropDown">
                        <div className="dropDownItem" onClick={logout}>
                            <i className="fa-solid fa-arrow-right-from-bracket"></i> Logout
                        </div>
                        <div className="dropDownItem"><i className="fa-solid fa-gear"></i> Settings</div>
                        <div className="dropDownItem"><i className="fa-solid fa-cloud-arrow-up"></i> Upgrade plan</div>
                    </div>
                }
            </div>

            <Chat />

            <ScaleLoader color="#fff" loading={loading} />

            <div className="chatInput">
                <div className="inputBox">
                    <input
                        placeholder="Ask anything"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' ? getReply() : null}
                    />
                    <div id="submit" onClick={getReply}><i className="fa-solid fa-paper-plane"></i></div>
                </div>
                <p className="info">
                    AuroraAI can make mistakes. Check important info. See Cookie Preferences.
                </p>
            </div>
        </div>
    );
}

export default ChatWindow;
