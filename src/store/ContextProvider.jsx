import { createContext, useEffect, useReducer, useState } from "react";

export const contextProviderDeclare=createContext({
    isloggedIn:Boolean,
    setLoggedIn:()=>{},
    setEditor:()=>{},
    editor:{},
    journalAssign:[],
    setjournalAssign:()=>{},
    reviewers:[],
    unApprovedReviewers:[],
    fetchReviewers:()=>{}
});

const journalAssignReducer=(state,action)=>{
    return action.payload;   
}

export const ContextProvider=({children})=>{
    
    const [isloggedIn,setLoggedIn]=useState(false);
    const [editor,setEditor]=useState({});
    
    const [journalAssign,dispatchAssign]=useReducer(journalAssignReducer,[]);
    
    const [reviewers,setReviewerList]=useState([]);
    const [unApprovedReviewers,setUnApprovedReviewers]=useState([]);

    const setjournalAssign= async(editorId)=>{
        const response=await fetch(`${import.meta.env.VITE_BACKEND_DJANGO_URL}/associate-editor/assigned-journals/${editorId}/`,{
            method:"GET",
            headers:{
                "content-type":"application/json"
            }
        })

        const data=await response.json();

        const journalAssignAction={
            type:"SET_JOURNAL_ASSIGN",
            payload:data
        }

        dispatchAssign(journalAssignAction);
    }
    
        const fetchReviewers=async()=>{
        const response=await fetch(`${import.meta.env.VITE_BACKEND_DJANGO_URL}/reviewer/unapproved/`,{
            method:"GET",
            headers:{
                "content-type":"application/json"
            }
        })

        const data=await response.json();

        setUnApprovedReviewers(data);
    }

    useEffect(() => {
        const approvedReviewerList = async () => {
            try {
            const response=await fetch(`${import.meta.env.VITE_BACKEND_DJANGO_URL}/reviewer/approved/`,{
                method:"GET",
                headers:{
                    "content-type":"application/json"
                }
            });
            
            const data=await response.json();
            console.log(data)
            setReviewerList(data);
            } catch (err) {
            setError(err.message || "Failed to load journal");
            }
        };

        const urlParams = new URLSearchParams(window.location.search);

        if (urlParams.get('logout') === 'true') {
            localStorage.removeItem('jwtToken');
            window.close(); // Close the tab after clearing token
            console.log('Hello from the Reviewer !');
            return;
        }

        const urlToken = urlParams.get('token');
        const localToken = localStorage.getItem('jwtToken');

        if (urlToken && !localToken) {
            localStorage.setItem('jwtToken', urlToken);
            console.log('Reviewer: Token stored from URL parameter');
        }

        const token = urlToken || localToken;

        if (!token) {
            window.location.href = 'https://journal-management-system-frontend.vercel.app/login';
            return;
        }

        const checkTokenValidation = async () => {
            try {

                const response = await fetch(`${import.meta.env.VITE_BACKEND_DJANGO_URL}/sso-auth/validate-token/`, {
                    method: "GET",
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/json"
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    setEditor(data);
                    setLoggedIn(true);
                    setjournalAssign(data.associate_editor_id);
                } else {
                    localStorage.removeItem('jwtToken');
                    setLoggedIn(false);
                    window.location.href = 'https://journal-management-system-frontend.vercel.app/login';
                }
            } catch (error) {
                console.error("Token validation error:", error);
                localStorage.removeItem('jwtToken');
                setLoggedIn(false);
                window.location.href = 'https://journal-management-system-frontend.vercel.app/login';
            }
        };
        
        checkTokenValidation();
        approvedReviewerList();
        fetchReviewers();
    }, []);

    return(
        <contextProviderDeclare.Provider value={{isloggedIn,setLoggedIn,editor,setEditor,journalAssign,setjournalAssign,reviewers,unApprovedReviewers}}>
            {children}
        </contextProviderDeclare.Provider>
    )
}