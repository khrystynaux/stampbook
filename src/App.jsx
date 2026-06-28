import { useEffect } from 'react'
import useGameStore from './store/useGameStore'
import WelcomeScreen from './components/WelcomeScreen'
import TopBar from './components/TopBar'
import HomeScreen from './components/HomeScreen'
import CityDetail from './components/CityDetail'
import StampModal from './components/StampModal'
import { ChangeNameModal, ResetModal } from './components/SettingsModals'

export default function App() {
  const { screen, modalActivityId, settingsScreen } = useGameStore(s => ({
    screen:          s.screen,
    modalActivityId: s.modalActivityId,
    settingsScreen:  s.settingsScreen,
  }))

  useEffect(() => { window.scrollTo(0, 0) }, [screen])

  if (screen === 'intro') return <WelcomeScreen />

  return (
    <div style={{ minHeight: '100dvh', background: '#fffdf7', display: 'flex', flexDirection: 'column' }}>
      <TopBar />
      <main style={{ flex: 1 }}>
        {screen === 'home' && <HomeScreen />}
        {screen === 'city' && <CityDetail />}
      </main>

      {modalActivityId && <StampModal />}
      {settingsScreen === 'name'  && <ChangeNameModal />}
      {settingsScreen === 'reset' && <ResetModal />}
    </div>
  )
}
