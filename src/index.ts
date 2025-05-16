(() => {
    const BUTTON_ID = "ing-csv-download-btn";
    const parent = document.querySelector("main") ?? document.body;

    const waitForElement = async <T extends HTMLElement>(
        check: () => T | null,
        description: string,
        timeout: number = 5000,
    ): Promise<T> =>
        new Promise((resolve, reject) => {
            const initial = check();
            if (initial) {
                return resolve(initial);
            }
            const observer = new MutationObserver(() => {
                const el = check();
                if (el) {
                    clearTimeout(timer);
                    observer.disconnect();
                    resolve(el);
                }
            });
            observer.observe(document.body, {childList: true, subtree: true});
            const timer = setTimeout(() => {
                observer.disconnect();
                reject(new Error(`Timed out waiting for ${description}`));
            }, timeout);
        });

    const selectByText = async (
        selector: string,
        text: string
    ): Promise<HTMLElement> => {
        return await waitForElement(
            () => {
                const elements = Array.from(document.querySelectorAll<HTMLElement>(selector));
                const matchingElements = elements.filter(el => el.textContent?.trim() === text);
                return matchingElements.length === 1 ? matchingElements[0] : null;
            },
            `element with text "${text}" for selector "${selector}"`
        );
    };

    const applyAndExport = async (): Promise<void> => {
        try {
            // Click on "1 Jahr"
            const yearEl = await selectByText("label.label--radio-chip", "1 Jahr");
            (yearEl.querySelector("input[type=radio]") as HTMLInputElement).click();

            // Click on "Filter anwenden"
            const applyButton = await selectByText(
                "button[name='filterAnzeige:ergebnisseAnzeigenButton']",
                "Filter anwenden"
            );
            applyButton.click();

            // Click on "Exportieren"
            const exportEl = await selectByText(
                "a.button-text-indigo",
                "Exportieren"
            );
            exportEl.click();

            // Wait for modal
            await waitForElement(
                () => document.querySelector<HTMLElement>(".panel-wrap--modal[aria-modal='true']"),
                "export modal"
            );

            // Click on "CSV (Excel)"
            const csvEl = await selectByText("label.label--radio", "CSV (Excel)");
            (csvEl.querySelector("input[type=radio]") as HTMLInputElement).click();

            // Click on "Exportieren"
            const confirmEl = await selectByText(
                "a.button.orange.font19",
                "Jetzt exportieren"
            );
            confirmEl.click();
        } catch (err) {
            const message = err instanceof Error ? err.message : String(err);
            alert(`Export failed: ${message}`);
            console.error("[ING CSV] ", err);
        }
    };

    const createButton = (): HTMLButtonElement => {
        const btn = document.createElement("button");
        btn.id = BUTTON_ID;
        btn.textContent = "Export CSV";
        Object.assign(btn.style, {
            position: "fixed",
            bottom: "16px",
            right: "16px",
        });
        btn.classList.add("button-default");
        btn.setAttribute("aria-label", "Exportiere CSV der letzten 12 Monate");
        btn.addEventListener("click", () => {
            btn.disabled = true;
            btn.textContent = "Exportiere...";
            btn.style.cursor = "wait";
            void applyAndExport().finally(() => {
                btn.disabled = false;
                btn.textContent = "Export CSV";
                btn.style.cursor = "pointer";
            });
        });
        return btn;
    };

    const inject = (): void => {
        if (!document.getElementById(BUTTON_ID)) {
            parent.append(createButton());
            observer.disconnect();
        }
    };

    const observer = new MutationObserver(inject);
    observer.observe(parent, {childList: true, subtree: true});

    inject();
})();
