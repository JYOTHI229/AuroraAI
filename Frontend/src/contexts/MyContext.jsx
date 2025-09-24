import { createContext, useState } from "react";

export const MyContext = createContext("");

export const MyProvider = ({ children }) => {
    const [prompt, setPrompt] = useState("");
    const [reply, setReply] = useState(null);
    const [currThreadId, setCurrThreadId] = useState("");
    const [prevChats, setPrevChats] = useState([]);
    const [newChat, setNewChat] = useState(true);
    const [allThreads, setAllThreads] = useState([]);

    const providerValues = {
        prompt, setPrompt,
        reply, setReply,
        currThreadId, setCurrThreadId,
        newChat, setNewChat,
        prevChats, setPrevChats,
        allThreads, setAllThreads
    };

    return (
        <MyContext.Provider value={providerValues}>
            {children}
        </MyContext.Provider>
    );
};
