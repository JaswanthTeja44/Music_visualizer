        const audioInput = document.getElementById("audioFile");
        const errorDiv = document.getElementById("error");
        const canvas = document.getElementById("visualizer");
        const ctx = canvas.getContext("2d");

        let audioContext;
        let analyser;
        let source;

        audioInput.addEventListener("change", function () {
            errorDiv.textContent = "";
            const file = this.files[0];

            if (!file || !file.type.startsWith("audio/")) {
                errorDiv.textContent = "Please upload a valid audio file.";
                return;
            }

            const reader = new FileReader();
            reader.onload = function (e) {
                const arrayBuffer = e.target.result;
                if (!audioContext) {
                    audioContext = new (window.AudioContext || window.webkitAudioContext)();
                }

                audioContext.decodeAudioData(arrayBuffer).then((audioBuffer) => {
                    if (source) {
                        source.disconnect();
                    }
                    source = audioContext.createBufferSource();
                    source.buffer = audioBuffer;
                    analyser = audioContext.createAnalyser();
                    analyser.fftSize = 256;
                    const bufferLength = analyser.frequencyBinCount;
                    const dataArray = new Uint8Array(bufferLength);

                    source.connect(analyser);
                    analyser.connect(audioContext.destination);
                    source.start();

                    function draw() {
                        requestAnimationFrame(draw);
                        analyser.getByteFrequencyData(dataArray);

                        ctx.fillStyle = "#141e30";
                        ctx.fillRect(0, 0, canvas.width, canvas.height);

                        const barWidth = (canvas.width / bufferLength) * 2.5;
                        let x = 0;

                        for (let i = 0; i < bufferLength; i++) {
                            const barHeight = dataArray[i];
                            const r = barHeight + 25 * (i / bufferLength);
                            const g = 250 * (i / bufferLength);
                            const b = 50;

                            ctx.fillStyle = `rgb(${r},${g},${b})`;
                            ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);

                            x += barWidth + 1;
                        }
                    }

                    draw();
                });
            };
            reader.readAsArrayBuffer(file);
        });

