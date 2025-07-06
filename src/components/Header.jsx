import { useContext } from "react"
import { contextProviderDeclare } from "../store/ContextProvider"
import NormalHeader from "./NormalHeader"
import LoggedHeader from "./LoggedHeader"

const Header=()=>{
    const getContextProvider=useContext(contextProviderDeclare)
    const {isloggedIn}=getContextProvider;

    return(
        <>
            {isloggedIn ? <LoggedHeader/> : <NormalHeader/>}
        </>
    )
}

export default Header;