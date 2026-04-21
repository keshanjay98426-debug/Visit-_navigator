import React, { useEffect } from 'react';
import { BookOpen, Map, Compass, Shield, HelpCircle } from 'lucide-react';

const UserManual = () => {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const manuals = [
        {
            title: "Getting Started",
            icon: <BookOpen size={24} />,
            description: "Learn the basics of navigating the portal and finding your dream destinations in Sri Lanka.",
            steps: [
                "Browse our list of locations on the Explore page.",
                "Use the search and filter options to find specific types of destinations.",
                "Click on any location to view detailed information, photos, and reviews."
            ]
        },
        {
            title: "Trip Planner Guide",
            icon: <Map size={24} />,
            description: "Learn our multi-location trip planner for planning your perfect trip.",
            steps: [
                "Click 'Add to Trip' on any location you wish to visit.",
                "Navigate to 'My Trip' to view your selected locations.",
                "Rearrange locations to optimize your route and calculate travel times.",
                "Save your trip for future reference."
            ]
        },
        {
            title: "Navigating Routes",
            icon: <Compass size={24} />,
            description: "Understand how routing works and what the distances mean.",
            steps: [
                "All routes are calculated starting from our base in Athurugiriya.",
                "Distances and times shown are estimates based on standard travel conditions.",
                "Use the interactive maps to visualize your entire journey."
            ]
        },
        {
            title: "Account & Privacy",
            icon: <Shield size={24} />,
            description: "Information about your data and account settings.",
            steps: [
                "Your planned trips are saved locally on your device for privacy.",
                "Admin accounts are restricted to authorized personnel only.",
                "We do not track continuous personal location data."
            ]
        }
    ];

    return (
        <div className="manual-page">
            <div className="manual-hero">
                <h1>User Manuals & Guides</h1>
                <p>Everything you need to know to make the most out of Visit Navigator.</p>
            </div>

            <div className="manual-content">
                <div className="manual-grid">
                    {manuals.map((manual, index) => (
                        <div key={index} className="manual-card">
                            <div className="card-header">
                                <div className="icon-wrapper">
                                    {manual.icon}
                                </div>
                                <h2>{manual.title}</h2>
                            </div>
                            <p className="manual-desc">{manual.description}</p>
                            <ul className="step-list">
                                {manual.steps.map((step, stepIndex) => (
                                    <li key={stepIndex}>
                                        <span className="step-bullet"></span>
                                        {step}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                <div className="help-section">
                    <div className="help-icon">
                        <HelpCircle size={32} color="#2e7d32" />
                    </div>
                    <h2>Still need help?</h2>
                    <p>If you can't find what you're looking for, our support team is available to assist you.</p>
                    <a href="mailto:info@visitnavigator.lk" className="contact-support-btn">Contact Support</a>
                </div>
            </div>

             </div>
    );
};

export default UserManual;