import { Outlet } from "react-router-dom"
import Footer from "./components/Footer"
import Header from "./components/Header"
import { ContextProvider } from "./store/ContextProvider";

function App() {
  return (
      <ContextProvider>
        <Header/>
        <div style={{ paddingTop: '80px' }}>
          <Outlet />
        </div>
        <Footer/>
      </ContextProvider>
  )
}

export default App;
