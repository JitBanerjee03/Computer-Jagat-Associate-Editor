import { useContext, useEffect, useState } from "react";
import AssociateEditorProfile from "../components/AssociateEditorProfile";
import { contextProviderDeclare } from "../store/ContextProvider";

const Account = () => {
    const getContextObject = useContext(contextProviderDeclare);
    const { editor } = getContextObject;
    const [associateEditorDetails, setAssociateEditorDetails] = useState({});
    
    useEffect(() => {
        if (!editor?.associate_editor_id) return;
        
        const getAssociateEditorProfileDetails = async () => {
            try {
                const response = await fetch(
                    `${import.meta.env.VITE_BACKEND_DJANGO_URL}/associate-editor/get-details/${editor.associate_editor_id}/`,
                    {
                        method: "GET",
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": `Bearer ${localStorage.getItem('access_token')}`
                        }
                    }
                );
                
                if (!response.ok) {
                    throw new Error('Failed to fetch associate editor profile');
                }
                
                const data = await response.json();
                setAssociateEditorDetails(data);
            } catch (error) {
                console.error('Error fetching associate editor profile:', error);
            }
        };

        getAssociateEditorProfileDetails();
    }, []);

    return (
        <AssociateEditorProfile associateEditor={associateEditorDetails} />
    );
};

export default Account;