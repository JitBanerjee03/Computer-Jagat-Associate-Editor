import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css'; //Import Bootstrap
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import Register from './pages/Register.jsx';
import Login from './pages/Login.jsx';
import About from './pages/About.jsx';
import Account from './pages/Account.jsx';
import EditorAssignment from './pages/EditorAssignment.jsx';
import JournalView from './pages/JournalView.jsx';
import AssignReviewer from './pages/AssignReviewer.jsx';
import ReviewerProfile from './components/ReviewerProfile.jsx';
import ReviewerFeedBack from './pages/ReviewerFeedBack.jsx';
import ReviewRecommendation from './pages/ReviewRecommendation.jsx';
import Recommendation from './pages/Recommendation.jsx';
import ReviewerStatus from './pages/ReviewerStatus.jsx';

const router=createBrowserRouter([
  {
    path:'/',
    element:<App/>,
    children:[
      {path:'/',element:<About/>},
      {path:'/sign-up',element:<Register/>},
      {path:'/login',element:<Login/>},
      {path:'/account',element:<Account/>},
      {path:'/assigned-journals',element:<EditorAssignment/>},
      {path:'/view-journal/:journalId',element:<JournalView/>},
      {path:'/assign-reviewer/:journalId',element:<AssignReviewer/>},
      {path:'/reviewer-profile/:reviewerId',element:<ReviewerProfile/>},
      {path:'/reviewer-assignment',element:<ReviewerFeedBack/>},
      {path:'/reviewer-feedback/:journalId',element:<ReviewRecommendation/>},
      {path:'/journal/:journalID/recommendation',element:<Recommendation/>},
      {path:'/reviewer-status',element:<ReviewerStatus/>}
    ]
  }
]);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router}/>
  </StrictMode>,
)
