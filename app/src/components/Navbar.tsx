import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
    return (
        <nav className="bg-gray-800 p-4">
            <div className="container mx-auto flex justify-between">
                <Link to="/" className="text-white">仪表盘</Link>
                <Link to="/staking" className="text-white">质押</Link>
                <Link to="/rewards" className="text-white">奖励</Link>
                <Link to="/referral" className="text-white">推荐</Link>
                <Link to="/level" className="text-white">等级</Link>
                <Link to="/meme-token" className="text-white">MEME代币</Link>
            </div>
        </nav>
    );
};

export default Navbar; 