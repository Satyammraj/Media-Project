import { useId, useState } from "react";


const Accordion = ({
    title,
    eyebrow,
    number,
    children,
    defaultOpen = false,
    open: controlledOpen,
    onOpenChange,
    className = "",
    disabled = false,
}) => {
    const [internalOpen, setInternalOpen] =
        useState(defaultOpen);

    const contentId = useId();

    const isControlled =
        controlledOpen !== undefined;

    const isOpen = isControlled
        ? controlledOpen
        : internalOpen;


    const toggle = () => {
        if (disabled) {
            return;
        }

        const nextOpen = !isOpen;

        if (!isControlled) {
            setInternalOpen(nextOpen);
        }

        onOpenChange?.(nextOpen);
    };


    return (
        <section
            className={`accordion ${
                isOpen
                    ? "accordion-open"
                    : ""
            } ${
                disabled
                    ? "accordion-disabled"
                    : ""
            } ${className}`}
        >

            <AccordionStyles />


            {/* =================================================
                HEADER
            ================================================= */}

            <button
                type="button"
                className="accordion-trigger"
                onClick={toggle}
                disabled={disabled}
                aria-expanded={isOpen}
                aria-controls={contentId}
            >

                <span className="accordion-index">
                    {number || "01"}
                </span>


                <span className="accordion-heading">

                    {eyebrow && (
                        <span className="accordion-eyebrow">
                            {eyebrow}
                        </span>
                    )}

                    <span className="accordion-title">
                        {title}
                    </span>

                </span>


                <span
                    className="accordion-indicator"
                    aria-hidden="true"
                >
                    <span />
                    <span />
                </span>

            </button>


            {/* =================================================
                CONTENT
            ================================================= */}

            <div
                id={contentId}
                className="accordion-content"
                aria-hidden={!isOpen}
            >
                <div className="accordion-content-inner">
                    {children}
                </div>
            </div>

        </section>
    );
};


/* =============================================================
   STYLES
   ============================================================= */

const AccordionStyles = () => (
    <style>{`

        /* =====================================================
           ACCORDION
        ===================================================== */

        .accordion {
            width: 100%;

            background:
                var(
                    --surface,
                    #1b1d24
                );

            border:
                1px solid
                var(
                    --border,
                    rgba(
                        255,
                        255,
                        255,
                        0.08
                    )
                );

            border-radius:
                var(
                    --radius-md,
                    12px
                );

            overflow: hidden;

            transition:
                border-color
                0.2s
                var(--ease, ease),

                background
                0.2s
                var(--ease, ease);
        }


        .accordion:hover {
            border-color:
                rgba(
                    255,
                    255,
                    255,
                    0.14
                );
        }


        .accordion-open {
            border-color:
                rgba(
                    207,
                    157,
                    86,
                    0.28
                );

            background:
                var(
                    --surface,
                    #1b1d24
                );
        }


        /* =====================================================
           TRIGGER
        ===================================================== */

        .accordion-trigger {
            width: 100%;

            min-height: 92px;

            display: grid;

            grid-template-columns:
                54px
                minmax(0, 1fr)
                44px;

            align-items: center;

            gap: 16px;

            padding:
                16px
                20px;

            border: none;

            background: transparent;

            color:
                var(
                    --text,
                    #f1efe9
                );

            text-align: left;

            cursor: pointer;
        }


        .accordion-trigger:focus-visible {
            outline:
                2px solid
                var(
                    --accent,
                    #cf9d56
                );

            outline-offset: -3px;
        }


        .accordion-trigger:disabled {
            cursor: not-allowed;
        }


        /* =====================================================
           NUMBER
        ===================================================== */

        .accordion-index {
            width: 42px;
            height: 42px;

            display: inline-flex;

            align-items: center;
            justify-content: center;

            border:
                1px solid
                var(
                    --border,
                    rgba(
                        255,
                        255,
                        255,
                        0.08
                    )
                );

            border-radius: 8px;

            color:
                var(
                    --text-muted,
                    #9a9ba6
                );

            font-family:
                "DM Mono",
                "Courier New",
                monospace;

            font-size: 11px;

            letter-spacing:
                0.05em;

            transition:
                color
                0.2s
                var(--ease, ease),

                background
                0.2s
                var(--ease, ease),

                border-color
                0.2s
                var(--ease, ease);
        }


        .accordion-open
        .accordion-index {
            color:
                var(
                    --accent,
                    #cf9d56
                );

            background:
                var(
                    --accent-soft,
                    rgba(
                        207,
                        157,
                        86,
                        0.14
                    )
                );

            border-color:
                rgba(
                    207,
                    157,
                    86,
                    0.25
                );
        }


        /* =====================================================
           HEADING
        ===================================================== */

        .accordion-heading {
            min-width: 0;

            display: flex;

            flex-direction: column;

            gap: 5px;
        }


        .accordion-eyebrow {
            color:
                var(
                    --text-muted,
                    #9a9ba6
                );

            font-size: 10px;

            font-weight: 700;

            letter-spacing:
                0.12em;

            text-transform:
                uppercase;
        }


        .accordion-title {
            display: block;

            overflow: hidden;

            color:
                var(
                    --text,
                    #f1efe9
                );

            font-family:
                var(
                    --display-font,
                    "Arial Black",
                    sans-serif
                );

            font-size:
                clamp(
                    1.15rem,
                    2vw,
                    1.55rem
                );

            font-weight: 800;

            line-height: 1;

            letter-spacing:
                -0.035em;

            white-space: nowrap;

            text-overflow: ellipsis;
        }


        .accordion-open
        .accordion-title {
            color:
                var(
                    --accent,
                    #cf9d56
                );
        }


        /* =====================================================
           INDICATOR
        ===================================================== */

        .accordion-indicator {
            width: 34px;
            height: 34px;

            position: relative;

            display: inline-flex;

            align-items: center;
            justify-content: center;

            border:
                1px solid
                var(
                    --border,
                    rgba(
                        255,
                        255,
                        255,
                        0.08
                    )
                );

            border-radius: 50%;

            transition:
                transform
                0.25s
                var(--ease, ease),

                background
                0.2s
                var(--ease, ease);
        }


        .accordion-indicator span {
            position: absolute;

            width: 12px;
            height: 1px;

            background:
                var(
                    --text-muted,
                    #9a9ba6
                );

            transition:
                transform
                0.25s
                var(--ease, ease);
        }


        .accordion-indicator span:last-child {
            transform: rotate(90deg);
        }


        .accordion-open
        .accordion-indicator {
            background:
                var(
                    --accent-soft,
                    rgba(
                        207,
                        157,
                        86,
                        0.14
                    )
                );

            border-color:
                rgba(
                    207,
                    157,
                    86,
                    0.25
                );
        }


        .accordion-open
        .accordion-indicator span {
            background:
                var(
                    --accent,
                    #cf9d56
                );
        }


        .accordion-open
        .accordion-indicator span:last-child {
            transform:
                rotate(0deg);
        }


        /* =====================================================
           CONTENT
        ===================================================== */

        .accordion-content {
            display: grid;

            grid-template-rows: 0fr;

            transition:
                grid-template-rows
                0.3s
                var(--ease, ease);
        }


        .accordion-open
        .accordion-content {
            grid-template-rows: 1fr;
        }


        .accordion-content-inner {
            min-height: 0;

            overflow: hidden;

            padding:
                0
                20px
                0
                90px;

            color:
                var(
                    --text-muted,
                    #9a9ba6
                );

            font-size: 13.5px;

            line-height: 1.7;

            opacity: 0;

            transform:
                translateY(-5px);

            transition:
                opacity
                0.2s
                var(--ease, ease),

                transform
                0.3s
                var(--ease, ease),

                padding
                0.3s
                var(--ease, ease);
        }


        .accordion-open
        .accordion-content-inner {
            padding:
                0
                20px
                24px
                90px;

            opacity: 1;

            transform:
                translateY(0);
        }


        /* =====================================================
           CONTENT ELEMENTS
        ===================================================== */

        .accordion-content-inner p {
            margin:
                0
                0
                12px;
        }


        .accordion-content-inner p:last-child {
            margin-bottom: 0;
        }


        .accordion-content-inner a {
            color:
                var(
                    --accent,
                    #cf9d56
                );

            text-decoration: none;
        }


        .accordion-content-inner a:hover {
            text-decoration: underline;
        }


        .accordion-content-inner ul {
            margin:
                0
                0
                12px;

            padding-left: 20px;
        }


        .accordion-content-inner li {
            margin-bottom: 5px;
        }


        /* =====================================================
           DISABLED
        ===================================================== */

        .accordion-disabled {
            opacity: 0.5;
        }


        /* =====================================================
           MOBILE
        ===================================================== */

        @media (max-width: 600px) {

            .accordion-trigger {
                min-height: 78px;

                grid-template-columns:
                    42px
                    minmax(0, 1fr)
                    38px;

                gap: 12px;

                padding:
                    14px;
            }


            .accordion-index {
                width: 36px;
                height: 36px;

                font-size: 10px;
            }


            .accordion-title {
                font-size: 1.05rem;
            }


            .accordion-content-inner {
                padding-left: 68px;
                padding-right: 14px;
            }


            .accordion-open
            .accordion-content-inner {
                padding-left: 68px;
                padding-right: 14px;
                padding-bottom: 18px;
            }

        }


        /* =====================================================
           REDUCED MOTION
        ===================================================== */

        @media (prefers-reduced-motion: reduce) {

            .accordion,
            .accordion *,
            .accordion *::before,
            .accordion *::after {
                transition: none !important;
            }

        }

    `}</style>
);


export default Accordion;