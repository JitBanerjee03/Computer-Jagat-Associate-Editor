import { useContext, useEffect } from "react";
import { contextProviderDeclare } from "../store/ContextProvider";
import AssignedJournals from "../components/AssignedJournals";
import EmptyMessage from "../components/EmptyMessage";

const EditorAssignment=()=>{
    const getContextProvider=useContext(contextProviderDeclare);
    const {journalAssign}=getContextProvider;

    return(
        <>
            {journalAssign.length===0 ? <EmptyMessage/> : <AssignedJournals assignments={journalAssign}/>}
        </>
    )
}

export default EditorAssignment;