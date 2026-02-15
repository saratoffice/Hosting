(function() {
            // get all color boxes (they already have data-color attribute)
            const colorBoxes = document.querySelectorAll('.color-box');
            const toast = document.getElementById('copy-toast');
            const copiedHexSpan = document.getElementById('copied-hex');

            // if no toast somehow, exit gracefully
            if (!toast || !copiedHexSpan) return;

            let hideTimeout = null;

            // function to hide toast with slight delay (reusable)
            function showToastMessage(hex) {
                // update hex text inside toast
                copiedHexSpan.textContent = hex;

                // clear any pending hide timeout
                if (hideTimeout) {
                    clearTimeout(hideTimeout);
                    hideTimeout = null;
                }

                // show toast (add show class)
                toast.classList.add('show');

                // set timer to hide after 1.5 seconds
                hideTimeout = setTimeout(() => {
                    toast.classList.remove('show');
                    hideTimeout = null;
                }, 1500);
            }

            // copy function using modern clipboard API, with fallback
            function copyToClipboard(text, fromElement) {
                // try using clipboard API first (secure context)
                if (navigator.clipboard && navigator.clipboard.writeText) {
                    navigator.clipboard.writeText(text).then(() => {
                        showToastMessage(text);
                    }).catch(err => {
                        console.warn('Clipboard write failed, using fallback', err);
                        fallbackCopy(text);
                    });
                } else {
                    // fallback for non-https or old browsers
                    fallbackCopy(text);
                }

                // fallback method using textarea
                function fallbackCopy(text) {
                    const textArea = document.createElement('textarea');
                    textArea.value = text;
                    // make it invisible
                    textArea.style.position = 'fixed';
                    textArea.style.top = '-999px';
                    textArea.style.left = '-999px';
                    textArea.style.width = '2em';
                    textArea.style.height = '2em';
                    textArea.style.padding = '0';
                    textArea.style.border = 'none';
                    textArea.style.outline = 'none';
                    textArea.style.boxShadow = 'none';
                    textArea.style.background = 'transparent';
                    document.body.appendChild(textArea);
                    textArea.focus();
                    textArea.select();

                    try {
                        const successful = document.execCommand('copy');
                        if (successful) {
                            showToastMessage(text);
                        } else {
                            alert('Press Ctrl+C to copy: ' + text);
                        }
                    } catch (err) {
                        alert('Could not copy, manual: ' + text);
                    } finally {
                        document.body.removeChild(textArea);
                    }
                }
            }

            // attach click handler to every color-box
            colorBoxes.forEach(box => {
                box.addEventListener('click', function(e) {
                    // get the hex from data-color (original source)
                    const hex = this.dataset.color;
                    if (!hex) return;  // fallback: maybe extract from child .color-code?
                    
                    // copy to clipboard
                    copyToClipboard(hex, this);

                    // optional little animation on the color block
                    const colorDiv = this.querySelector('.color');
                    if (colorDiv) {
                        colorDiv.style.transition = 'filter 0.15s, box-shadow 0.15s';
                        colorDiv.style.filter = 'brightness(1.1) saturate(1.2)';
                        colorDiv.style.boxShadow = '0 0 0 3px white, 0 8px 18px black';
                        setTimeout(() => {
                            colorDiv.style.filter = '';
                            colorDiv.style.boxShadow = '';
                        }, 200);
                    }
                });

                // also show pointer cursor (already in css, but ensure)
                box.style.cursor = 'pointer';
            });

            // if a box contains .color-code we could also use that, but data-color is reliable.
            // Just in case any .color-box missing data-color? (all provided have it)
            // Add a tiny extra: if data-color is missing, read from child .color-code text.
            // but here we trust the given HTML (it's complete).
        })();
