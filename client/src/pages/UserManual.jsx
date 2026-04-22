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

                        <style>{`
                .manual-page {
                    min-height: 100vh;
                    background-color: #fcfdfb;
                    padding-top: 100px;
                    padding-bottom: 60px;
                    font-family: 'Outfit', 'Inter', sans-serif;
                }

                .manual-hero {
                    text-align: center;
                    padding: 60px 20px;
                    background: linear-gradient(135deg, rgba(46, 125, 50, 0.05) 0%, rgba(129, 199, 132, 0.1) 100%);
                    border-radius: 30px;
                    max-width: 1200px;
                    margin: 0 auto 60px;
                }

                .manual-hero h1 {
                    font-size: 3rem;
                    color: #1a1a1a;
                    margin-bottom: 20px;
                    letter-spacing: -1px;
                }

                .manual-hero p {
                    font-size: 1.2rem;
                    color: #64748b;
                    max-width: 600px;
                    margin: 0 auto;
                }

                .manual-content {
                    max-width: 1200px;
                    margin: 0 auto;
                    padding: 0 20px;
                }

                .manual-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
                    gap: 30px;
                    margin-bottom: 80px;
                }

                .manual-card {
                    background: #fff;
                    border-radius: 24px;
                    padding: 40px;
                    box-shadow: 0 10px 40px rgba(0,0,0,0.03);
                    border: 1px solid rgba(0,0,0,0.05);
                    transition: transform 0.3s ease, box-shadow 0.3s ease;
                }

                .manual-card:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 20px 40px rgba(0,0,0,0.06);
                }

                .card-header {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                    margin-bottom: 20px;
                }

                .icon-wrapper {
                    background: rgba(46, 125, 50, 0.1);
                    color: #2e7d32;
                    width: 50px;
                    height: 50px;
                    border-radius: 14px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .card-header h2 {
                    font-size: 1.5rem;
                    color: #1a1a1a;
                    margin: 0;
                }

                .manual-desc {
                    color: #64748b;
                    line-height: 1.6;
                    margin-bottom: 24px;
                }

                .step-list {
                    list-style: none;
                    padding: 0;
                    margin: 0;
                }

                .step-list li {
                    position: relative;
                    padding-left: 24px;
                    margin-bottom: 12px;
                    color: #4a4a4a;
                    line-height: 1.5;
                }

                .step-bullet {
                    position: absolute;
                    left: 0;
                    top: 8px;
                    width: 8px;
                    height: 8px;
                    background: #81c784;
                    border-radius: 50%;
                }

                .help-section {
                    text-align: center;
                    padding: 60px;
                    background: #fff;
                    border-radius: 30px;
                    box-shadow: 0 10px 40px rgba(0,0,0,0.03);
                    border: 1px solid rgba(0,0,0,0.05);
                }

                .help-icon {
                    margin-bottom: 20px;
                }

                .help-section h2 {
                    font-size: 2rem;
                    color: #1a1a1a;
                    margin-bottom: 16px;
                }

                .help-section p {
                    color: #64748b;
                    margin-bottom: 30px;
                    font-size: 1.1rem;
                }

                .contact-support-btn {
                    display: inline-block;
                    background: #2e7d32;
                    color: #fff;
                    text-decoration: none;
                    padding: 14px 32px;
                    border-radius: 30px;
                    font-weight: 600;
                    transition: all 0.2s;
                    box-shadow: 0 4px 15px rgba(46, 125, 50, 0.2);
                }

                .contact-support-btn:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 6px 20px rgba(46, 125, 50, 0.3);
                    background: #276b2b;
                }

                @media (max-width: 768px) {
                    .manual-hero {
                        padding: 40px 20px;
                        border-radius: 20px;
                    }
                    .manual-hero h1 {
                        font-size: 2.2rem;
                    }
                    .manual-grid {
                        grid-template-columns: 1fr;
                    }
                    .manual-card {
                        padding: 30px 20px;
                    }
                }
            `}</style>

             </div>
    );
};

export default UserManual;