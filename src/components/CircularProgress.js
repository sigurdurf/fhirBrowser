(function () {
    class CircularProgress extends HTMLElement {
        constructor() {
            super();
            this.attachShadow({ mode: 'closed' }).appendChild(template.content.cloneNode(true));
        }
    };

    const template = document.createElement('template');
    template.innerHTML = `
        <style>
            main {
                height: 0.70em;
                width: 0.70em;
                color: var(--primary-color);
                display: inline-block;
                border: 0.15em solid;
                border-radius: 50%;
                border-top-color: transparent;
                animation: rotate 1s linear infinite;
            }

            @keyframes rotate {
                0% {transform: rotate(0);}
                100% {transform: rotate(360deg);}
            }
        </style>
        <main/>
    `;

    window.customElements.define('circular-progress', CircularProgress);
})();
