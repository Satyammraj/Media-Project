import { Link } from "react-router-dom";

const SiteFooter = () => {
    return (
        <footer className="site-footer">
            <SiteFooterStyles />

            <div className="site-footer-top">
                <div className="site-footer-brand">
                    <span className="footer-index">
                        04 / END
                    </span>

                    <h2>
                        VIDEOLY
                    </h2>

                    <p>
                        Discover videos,
                        creators, and stories
                        worth watching.
                    </p>
                </div>

                <div className="site-footer-links">
                    <div className="footer-link-group">
                        <span className="footer-label">
                            EXPLORE
                        </span>

                        <Link to="/">
                            Home
                        </Link>

                        <Link to="/trending">
                            Trending
                        </Link>

                        <Link to="/subscriptions">
                            Subscriptions
                        </Link>
                    </div>

                    <div className="footer-link-group">
                        <span className="footer-label">
                            CREATE
                        </span>

                        <Link to="/upload">
                            Upload
                        </Link>

                        <Link to="/channel">
                            Channel
                        </Link>

                        <Link to="/settings">
                            Settings
                        </Link>
                    </div>

                    <div className="footer-link-group">
                        <span className="footer-label">
                            VIDEOLY
                        </span>

                        <Link to="/">
                            About
                        </Link>

                        <Link to="/">
                            Community
                        </Link>

                        <Link to="/">
                            Contact
                        </Link>
                    </div>
                </div>
            </div>

            <div className="site-footer-bottom">
                <span>
                    © {new Date().getFullYear()} VIDEOLY
                </span>

                <span>
                    DISCOVER / WATCH / CREATE
                </span>

                <span>
                    ↑ BACK TO TOP
                </span>
            </div>
        </footer>
    );
};


const SiteFooterStyles = () => (
    <style>{`

        .site-footer {
            margin-top: 100px;

            padding:
                0
                0
                24px;

            border-top:
                1px solid
                var(
                    --border,
                    rgba(
                        255,
                        255,
                        255,
                        0.12
                    )
                );

            color:
                var(
                    --foreground,
                    #f5f5f5
                );
        }


        .site-footer-top {
            display: grid;

            grid-template-columns:
                minmax(280px, 1fr)
                minmax(420px, 1.5fr);

            gap: 60px;

            padding:
                50px
                0
                70px;
        }


        .site-footer-brand {
            display: flex;

            flex-direction: column;

            align-items: flex-start;
        }


        .footer-index {
            margin-bottom: 20px;

            color:
                var(
                    --muted,
                    #9a9da1
                );

            font-family:
                "DM Mono",
                monospace;

            font-size: 9px;

            letter-spacing:
                0.08em;
        }


        .site-footer-brand h2 {
            margin: 0;

            font-family:
                var(
                    --display-font,
                    "Space Grotesk",
                    sans-serif
                );

            font-size:
                clamp(
                    3rem,
                    7vw,
                    7rem
                );

            font-weight: 700;

            line-height: 0.8;

            letter-spacing:
                -0.08em;
        }


        .site-footer-brand p {
            max-width: 260px;

            margin:
                28px
                0
                0;

            color:
                var(
                    --muted,
                    #9a9da1
                );

            font-size: 12px;

            line-height: 1.6;
        }


        .site-footer-links {
            display: grid;

            grid-template-columns:
                repeat(
                    3,
                    1fr
                );

            gap: 30px;

            align-content:
                start;
        }


        .footer-link-group {
            display: flex;

            flex-direction: column;

            align-items:
                flex-start;

            gap: 11px;
        }


        .footer-label {
            margin-bottom: 10px;

            color:
                var(
                    --muted,
                    #9a9da1
                );

            font-family:
                "DM Mono",
                monospace;

            font-size: 8px;

            letter-spacing:
                0.1em;
        }


        .footer-link-group a {
            position: relative;

            font-size: 13px;

            transition:
                opacity 0.15s
                ease;
        }


        .footer-link-group a::after {
            content: "";

            position: absolute;

            left: 0;
            bottom: -3px;

            width: 0;

            height: 1px;

            background:
                var(
                    --accent,
                    #ffffff
                );

            transition:
                width 0.2s
                ease;
        }


        .footer-link-group a:hover {
            opacity: 0.7;
        }


        .footer-link-group a:hover::after {
            width: 100%;
        }


        .site-footer-bottom {
            display: flex;

            align-items: center;

            justify-content:
                space-between;

            gap: 20px;

            padding-top: 14px;

            border-top:
                1px solid
                var(
                    --border,
                    rgba(
                        255,
                        255,
                        255,
                        0.12
                    )
                );

            color:
                var(
                    --muted,
                    #9a9da1
                );

            font-family:
                "DM Mono",
                monospace;

            font-size: 8px;

            letter-spacing:
                0.08em;
        }


        .site-footer-bottom span:last-child {
            color:
                var(
                    --foreground,
                    #f5f5f5
                );
        }


        @media (max-width: 800px) {

            .site-footer-top {
                grid-template-columns:
                    1fr;

                gap: 50px;
            }


            .site-footer-links {
                grid-template-columns:
                    repeat(
                        3,
                        1fr
                    );
            }

        }


        @media (max-width: 520px) {

            .site-footer {
                margin-top: 70px;
            }


            .site-footer-top {
                padding:
                    40px
                    0
                    45px;
            }


            .site-footer-links {
                grid-template-columns:
                    1fr
                    1fr;

                gap:
                    35px
                    20px;
            }


            .site-footer-bottom {
                align-items:
                    flex-start;

                flex-direction:
                    column;

                gap: 8px;
            }

        }

    `}</style>
);


export default SiteFooter;