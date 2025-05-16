(() => {
    const BUTTON_ID = "ing-csv-download-btn";

    const waitFor = <T>(
        fn: () => T | null,
        errMsg: string,
        interval = 100,
        timeout = 5000
    ): Promise<T> =>
        new Promise((resolve, reject) => {
            const start = Date.now();
            const check = () => {
                const result = fn();
                if (result) {
                    return resolve(result);
                }
                if (Date.now() - start > timeout) {
                    return reject(new Error(errMsg));
                }
                setTimeout(check, interval);
            };
            check();
        });

    const selectByText = async (
        selector: string,
        text: string
    ): Promise<HTMLElement> => {
        return await waitFor(
            () => {
                const elements = Array.from(document.querySelectorAll<HTMLElement>(selector));
                const matchingElements = elements.filter(el => el.textContent?.trim() === text);
                return matchingElements.length === 1 ? matchingElements[0] : null;
            },
            `Element with text "${text}" not found or multiple found for selector "${selector}"`
        );
    };

    const waitForModal = (timeout = 5000): Promise<Element> =>
        new Promise((resolve, reject) => {
            const observer = new MutationObserver(() => {
                const modal = document.querySelector(".panel-wrap--modal[aria-modal='true']");
                if (modal) {
                    observer.disconnect();
                    resolve(modal);
                }
            });
            observer.observe(document.body, {childList: true, subtree: true});
            setTimeout(() => {
                observer.disconnect();
                reject(new Error("Export modal not found"));
            }, timeout);
        });

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

            // Wait for modal via MutationObserver
            await waitForModal();

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
        btn.addEventListener("click", () => {
            void applyAndExport();
        });
        return btn;
    };

    const inject = (): void => {
        if (!document.getElementById(BUTTON_ID)) {
            document.body.append(createButton());
            observer.disconnect();
        }
    };

    const observer = new MutationObserver(inject);
    observer.observe(document.body, {childList: true, subtree: true});

    inject();
})();
