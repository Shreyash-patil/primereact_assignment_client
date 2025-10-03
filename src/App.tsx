import { PrimeReactProvider } from 'primereact/api';
import PrimeTable from "./components/PrimeTable.tsx"

const App = () => {
  return (
    <>
<PrimeReactProvider>
  <PrimeTable/>
</PrimeReactProvider>
    </>
  )
}

export default App