import "./WelcomeHero.css"
import { NavLink } from "react-router";

const FEATURES = [
    {
        title: "Organise by journal",
        description: "Keep separate journals for work, travel or daily reflections.",
        icon: (
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V3H6.5A2.5 2.5 0 0 0 4 5.5v14zM4 19.5A2.5 2.5 0 0 0 6.5 22H20v-5" />
        ),
    },
    {
        title: "Write freely",
        description: "Create, edit and revisit entries whenever inspiration strikes.",
        icon: (
            <path d="M12 20h9M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
        ),
    },
    {
        title: "Private by default",
        description: "Your account is secured, so your entries stay yours.",
        icon: (
            <>
                <rect x="3" y="11" width="18" height="11" rx="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </>
        ),
    },
]

function WelcomeHero() {
    return (
        <main className="welcome">
            <section className="welcome-hero">
                <h1 className="welcome-heading">A quiet place for your thoughts</h1>
                <p className="welcome-subheading">
                    My Diary helps you capture the moments, ideas and reflections that matter, all in one calm, private space.
                </p>
                <div className="welcome-actions">
                    <NavLink to="/sign-up" className="welcome-button welcome-button--primary">
                        Start writing
                    </NavLink>
                    <NavLink to="/sign-in" className="welcome-button welcome-button--secondary">
                        I already have an account
                    </NavLink>
                </div>
            </section>

            <ul className="welcome-features">
                {FEATURES.map((feature) => (
                    <li key={feature.title} className="welcome-feature">
                        <span className="welcome-feature-icon">
                            <svg
                                aria-hidden="true"
                                viewBox="0 0 24 24"
                                width="24"
                                height="24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.75"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                {feature.icon}
                            </svg>
                        </span>
                        <h2 className="welcome-feature-title">{feature.title}</h2>
                        <p className="welcome-feature-description">{feature.description}</p>
                    </li>
                ))}
            </ul>
        </main>
    )
}
export default WelcomeHero
