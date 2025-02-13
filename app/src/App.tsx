import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import DashboardPage from './pages/DashboardPage';
import StakingPage from './pages/StakingPage';
import RewardsPage from './pages/RewardsPage';
import ReferralPage from './pages/ReferralPage';
import LevelPage from './pages/LevelPage';
import MemeTokenPage from './pages/MemeTokenPage';
import Navbar from './components/Navbar';

const App = () => {
    return (
        <Router>
            <Navbar />
            <div className="container mx-auto p-4">
                <Switch>
                    <Route path="/" exact component={DashboardPage} />
                    <Route path="/staking" component={StakingPage} />
                    <Route path="/rewards" component={RewardsPage} />
                    <Route path="/referral" component={ReferralPage} />
                    <Route path="/level" component={LevelPage} />
                    <Route path="/meme-token" component={MemeTokenPage} />
                </Switch>
            </div>
        </Router>
    );
};

export default App; 