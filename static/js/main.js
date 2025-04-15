class PetriNetSimulation {
    constructor() {
        this.state = null;
        this.isRunning = false;
        this.simulationInterval = null;
        this.svg = null;
        this.petriNetData = {
            nodes: [
                // Places for Traffic Light 1 (Left)
                { id: "S1_Red", type: "place", label: "S1R", x: 150, y: 100 },
                { id: "S1_Yellow", type: "place", label: "S1Y", x: 250, y: 100 },
                { id: "S1_Green", type: "place", label: "S1G", x: 350, y: 100 },
                
                // Places for Traffic Light 2 (Right)
                { id: "S2_Red", type: "place", label: "S2R", x: 150, y: 200 },
                { id: "S2_Yellow", type: "place", label: "S2Y", x: 250, y: 200 },
                { id: "S2_Green", type: "place", label: "S2G", x: 350, y: 200 },
                
                // Places for Traffic Light 3 (Bottom)
                { id: "S3_Red", type: "place", label: "S3R", x: 150, y: 300 },
                { id: "S3_Yellow", type: "place", label: "S3Y", x: 250, y: 300 },
                { id: "S3_Green", type: "place", label: "S3G", x: 350, y: 300 },
                
                // Transitions between states
                { id: "T1", type: "transition", label: "T1", x: 200, y: 150 },
                { id: "T2", type: "transition", label: "T2", x: 300, y: 150 },
                { id: "T3", type: "transition", label: "T3", x: 200, y: 250 },
                { id: "T4", type: "transition", label: "T4", x: 300, y: 250 }
            ],
            edges: [
                // State 1 to State 2 (T1)
                { source: "S1_Green", target: "T1" },
                { source: "S2_Green", target: "T1" },
                { source: "T1", target: "S1_Yellow" },
                { source: "T1", target: "S2_Yellow" },
                { source: "S3_Red", target: "T1" },
                { source: "T1", target: "S3_Red" },

                // State 2 to State 3 (T2)
                { source: "S1_Yellow", target: "T2" },
                { source: "S2_Yellow", target: "T2" },
                { source: "T2", target: "S1_Red" },
                { source: "T2", target: "S2_Red" },
                { source: "S3_Red", target: "T2" },
                { source: "T2", target: "S3_Green" },

                // State 3 to State 4 (T3)
                { source: "S1_Red", target: "T3" },
                { source: "S2_Red", target: "T3" },
                { source: "S3_Green", target: "T3" },
                { source: "T3", target: "S1_Red" },
                { source: "T3", target: "S2_Red" },
                { source: "T3", target: "S3_Yellow" },

                // State 4 back to State 1 (T4)
                { source: "S1_Red", target: "T4" },
                { source: "S2_Red", target: "T4" },
                { source: "S3_Yellow", target: "T4" },
                { source: "T4", target: "S1_Green" },
                { source: "T4", target: "S2_Green" },
                { source: "T4", target: "S3_Red" }
            ]
        };
        
        this.vehicles = {
            horizontalRight: [],
            horizontalLeft: [],
            vertical: []
        };
        this.vehicleTypes = ['vehicle1.png', 'vehicle2.png', 'vehicle3.png'];
        this.initializeVehicles();
        this.initializeBackground();
        this.initializeControls();
        this.initializePetriNet();
        this.fetchState();
    }

    initializeBackground() {
        const intersection = document.getElementById('intersection');
        intersection.style.backgroundImage = "url('/static/images/background.png')";
        intersection.style.backgroundSize = 'cover';
        intersection.style.backgroundPosition = 'center';
    }

    initializeVehicles() {
        // Clear any existing vehicles
        document.querySelectorAll('.vehicle').forEach(v => v.remove());

        // Create vehicle pool
        for (let i = 0; i < 3; i++) {
            // Horizontal vehicles moving right
            const hVehicleRight = document.createElement('div');
            hVehicleRight.className = 'vehicle horizontal right';
            hVehicleRight.style.backgroundImage = `url('/static/images/${this.vehicleTypes[i % this.vehicleTypes.length]}')`;
            document.querySelector('.horizontal-road').appendChild(hVehicleRight);
            this.vehicles.horizontalRight.push(hVehicleRight);

            // Horizontal vehicles moving left
            const hVehicleLeft = document.createElement('div');
            hVehicleLeft.className = 'vehicle horizontal left';
            hVehicleLeft.style.backgroundImage = `url('/static/images/${this.vehicleTypes[i % this.vehicleTypes.length]}')`;
            document.querySelector('.horizontal-road').appendChild(hVehicleLeft);
            this.vehicles.horizontalLeft.push(hVehicleLeft);

            // Vertical vehicles
            const vVehicle = document.createElement('div');
            vVehicle.className = 'vehicle vertical';
            vVehicle.style.backgroundImage = `url('/static/images/${this.vehicleTypes[i % this.vehicleTypes.length]}')`;
            document.querySelector('.vertical-road').appendChild(vVehicle);
            this.vehicles.vertical.push(vVehicle);
        }
    }

    initializeControls() {
        document.getElementById('start').addEventListener('click', () => this.startSimulation());
        document.getElementById('pause').addEventListener('click', () => this.pauseSimulation());
        document.getElementById('reset').addEventListener('click', () => this.resetSimulation());
        document.getElementById('save').addEventListener('click', () => this.saveSimulation());
        document.getElementById('load').addEventListener('click', () => this.loadSimulation());
    }

    initializePetriNet() {
        const width = 600;
        const height = 400;
        
        this.svg = d3.select("#petri-net")
            .append("svg")
            .attr("width", width)
            .attr("height", height);

        // Add arrow markers for edges
        this.svg.append("defs").append("marker")
            .attr("id", "arrowhead")
            .attr("viewBox", "0 -5 10 10")
            .attr("refX", 8)
            .attr("refY", 0)
            .attr("markerWidth", 8)
            .attr("markerHeight", 8)
            .attr("orient", "auto")
            .append("path")
            .attr("d", "M0,-5L10,0L0,5")
            .attr("fill", "#999");

        // Invertir la dirección de las líneas de conexión
        this.svg.selectAll("line.edge")
            .data(this.petriNetData.edges)
            .enter()
            .append("line")
            .attr("class", "edge")
            .attr("x1", d => this.getNode(d.target).x)
            .attr("y1", d => this.getNode(d.target).y)
            .attr("x2", d => this.getNode(d.source).x)
            .attr("y2", d => this.getNode(d.source).y)
            .attr("stroke", "#999")
            .attr("stroke-width", 1.5)
            .attr("marker-end", "url(#arrowhead)");

        // Create node groups
        const nodes = this.svg.selectAll("g.node")
            .data(this.petriNetData.nodes)
            .enter()
            .append("g")
            .attr("class", d => `node ${d.type}`)
            .attr("transform", d => `translate(${d.x},${d.y})`);

        // Draw places (circles)
        nodes.filter(d => d.type === "place")
            .append("circle")
            .attr("r", 20)
            .attr("class", d => `place ${d.id}`)
            .attr("fill", "white")
            .attr("stroke", "black")
            .attr("stroke-width", 2);

        // Draw transitions (rectangles)
        nodes.filter(d => d.type === "transition")
            .append("rect")
            .attr("x", -15)
            .attr("y", -15)
            .attr("width", 30)
            .attr("height", 30)
            .attr("class", d => `transition ${d.id}`)
            .attr("fill", "white")
            .attr("stroke", "black")
            .attr("stroke-width", 2);

        // Add labels
        nodes.append("text")
            .attr("dy", 35)
            .attr("text-anchor", "middle")
            .style("font-size", "12px")
            .text(d => d.label);

        // Add tokens
        nodes.filter(d => d.type === "place")
            .append("circle")
            .attr("class", d => `token ${d.id}-token`)
            .attr("r", 8)
            .attr("fill", "#4CAF50")
            .style("display", "none");
    }

    updateTokens() {
        if (!this.state) return;

        // Update token visibility
        this.svg.selectAll(".token")
            .style("display", (d) => {
                return this.state[d.id] === 1 ? "inline" : "none";
            });

        // Update transition colors and animation
        this.svg.selectAll(".transition rect")
            .attr("fill", (d) => {
                // Si la transición está habilitada, color vibrante
                return this.isTransitionEnabled(d.id) ? "#f72585" : "#fff";
            })
            .attr("stroke-width", (d) => {
                return this.isTransitionEnabled(d.id) ? 4 : 2;
            })
            .attr("filter", (d) => {
                return this.isTransitionEnabled(d.id) ? "drop-shadow(0 0 10px #f72585cc)" : "none";
            });
    }

    updateVehicles() {
        // Update horizontal vehicles based on traffic light state
        const canMoveHorizontal = this.state['S1_Green'] === 1 && this.state['S2_Green'] === 1;
        
        // Update right-moving vehicles
        this.vehicles.horizontalRight.forEach((vehicle, index) => {
            if (canMoveHorizontal) {
                vehicle.classList.add('moving');
                vehicle.style.animationDelay = `${index * 1.5}s`;
            } else {
                vehicle.classList.remove('moving');
                vehicle.style.animationDelay = '0s';
            }
        });

        // Update left-moving vehicles
        this.vehicles.horizontalLeft.forEach((vehicle, index) => {
            if (canMoveHorizontal) {
                vehicle.classList.add('moving');
                vehicle.style.animationDelay = `${index * 1.5}s`;
            } else {
                vehicle.classList.remove('moving');
                vehicle.style.animationDelay = '0s';
            }
        });

        // Update vertical vehicles
        const canMoveVertical = this.state['S3_Green'] === 1;
        this.vehicles.vertical.forEach((vehicle, index) => {
            if (canMoveVertical) {
                vehicle.classList.add('moving');
                vehicle.style.animationDelay = `${index * 1.5}s`;
            } else {
                vehicle.classList.remove('moving');
                vehicle.style.animationDelay = '0s';
            }
        });
    }

    isTransitionEnabled(transitionId) {
        if (!this.state || !this.transitions) return false;

        const transition = this.transitions[transitionId];
        if (!transition) return false;

        // Check if all input places have tokens
        return transition.input.every(place => this.state[place] === 1);
    }

    getNode(id) {
        return this.petriNetData.nodes.find(node => node.id === id);
    }

    async fetchState() {
        try {
            const response = await fetch('/state');
            const data = await response.json();
            this.state = data;
            this.transitions = {
                'T1': {
                    input: ['S1_Green', 'S2_Green', 'S3_Red'],
                    output: ['S1_Yellow', 'S2_Yellow', 'S3_Red']
                },
                'T2': {
                    input: ['S1_Yellow', 'S2_Yellow', 'S3_Red'],
                    output: ['S1_Red', 'S2_Red', 'S3_Green']
                },
                'T3': {
                    input: ['S1_Red', 'S2_Red', 'S3_Green'],
                    output: ['S1_Red', 'S2_Red', 'S3_Yellow']
                },
                'T4': {
                    input: ['S1_Red', 'S2_Red', 'S3_Yellow'],
                    output: ['S1_Green', 'S2_Green', 'S3_Red']
                }
            };
            this.updateTrafficLights();
            this.updateTransitionInfo();
            this.updateTokens();
            this.updateVehicles();
        } catch (error) {
            console.error('Error fetching state:', error);
        }
    }

    updateTrafficLights() {
        const updateLight = (semaphoreId, color) => {
            const light = document.querySelector(`#${semaphoreId} .light.${color}`);
            if (light) {
                const isActive = this.state[`${semaphoreId.replace('semaphore', 'S')}_${color.charAt(0).toUpperCase() + color.slice(1)}`] === 1;
                light.classList.toggle('active', isActive);
            }
        };

        // Update each traffic light
        ['red', 'yellow', 'green'].forEach(color => {
            updateLight('semaphore1', color);
            updateLight('semaphore2', color);
            updateLight('semaphore3', color);
        });
    }

    updateTransitionInfo() {
        const info = document.getElementById('transition-info');
        info.innerHTML = `
            <p><strong>Estado Actual:</strong></p>
            <p>Semáforo 1 (Izquierda): ${this.getTrafficLightState(1)}</p>
            <p>Semáforo 2 (Derecha): ${this.getTrafficLightState(2)}</p>
            <p>Semáforo 3 (Inferior): ${this.getTrafficLightState(3)}</p>
        `;
    }

    getTrafficLightState(number) {
        if (this.state[`S${number}_Green`] === 1) return 'Verde';
        if (this.state[`S${number}_Yellow`] === 1) return 'Amarillo';
        if (this.state[`S${number}_Red`] === 1) return 'Rojo';
        return 'Desconocido';
    }

    async startSimulation() {
        if (!this.isRunning) {
            this.isRunning = true;
            this.simulationInterval = setInterval(() => this.step(), 7000); // 7 seconds interval
            document.getElementById('start').disabled = true;
            document.getElementById('pause').disabled = false;
        }
    }

    pauseSimulation() {
        if (this.isRunning) {
            this.isRunning = false;
            clearInterval(this.simulationInterval);
            document.getElementById('start').disabled = false;
            document.getElementById('pause').disabled = true;
        }
    }

    async resetSimulation() {
        this.pauseSimulation();
        await this.fetchState();
    }

    animateTokenTransition(fromId, transitionId, toId) {
        const fromNode = this.getNode(fromId);
        const transitionNode = this.getNode(transitionId);
        const toNode = this.getNode(toId);
        if (!fromNode || !transitionNode || !toNode) return;

        const svg = this.svg;
        // Crea el token en la plaza de origen
        const token = svg.append("circle")
            .attr("cx", fromNode.x)
            .attr("cy", fromNode.y)
            .attr("r", 10)
            .attr("fill", "#e63946")
            .attr("opacity", 1)
            .attr("class", "animated-token");

        // 1. Anima de la plaza a la transición
        token.transition()
            .duration(700)
            .attr("cx", transitionNode.x)
            .attr("cy", transitionNode.y)
            .attr("r", 10)
            .on("end", function() {
                // 2. Anima de la transición a la plaza destino
                token.transition()
                    .duration(700)
                    .attr("cx", toNode.x)
                    .attr("cy", toNode.y)
                    .attr("r", 8)
                    .attr("opacity", 0.85)
                    .on("end", function() {
                        // Elimina el token animado al finalizar
                        token.remove();
                    });
            });
    }

    async step() {
        try {
            const response = await fetch('/transition/next', {
                method: 'POST'
            });
            const result = await response.json();
            if (result.status === 'success') {
                const prevState = { ...this.state };
                this.state = result.state;
                this.updateTrafficLights();
                this.updateTransitionInfo();
                this.updateTokens();
                this.updateVehicles();

                // Detecta y anima el movimiento de tokens pasando por la transición
                const transitions = [
                    { id: 'T1', from: ['S1_Green', 'S2_Green', 'S3_Red'], to: ['S1_Yellow', 'S2_Yellow', 'S3_Red'] },
                    { id: 'T2', from: ['S1_Yellow', 'S2_Yellow', 'S3_Red'], to: ['S1_Red', 'S2_Red', 'S3_Green'] },
                    { id: 'T3', from: ['S1_Red', 'S2_Red', 'S3_Green'], to: ['S1_Red', 'S2_Red', 'S3_Yellow'] },
                    { id: 'T4', from: ['S1_Red', 'S2_Red', 'S3_Yellow'], to: ['S1_Green', 'S2_Green', 'S3_Red'] }
                ];
                for (const t of transitions) {
                    const wasActive = t.from.every(p => prevState[p] === 1);
                    const isNow = t.to.every(p => this.state[p] === 1);
                    if (wasActive && isNow) {
                        for (let i = 0; i < t.from.length; i++) {
                            this.animateTokenTransition(t.from[i], t.id, t.to[i]);
                        }
                        break;
                    }
                }
            }
        } catch (error) {
            console.error('Error in simulation step:', error);
            this.pauseSimulation();
        }
    }

    async saveSimulation() {
        try {
            const response = await fetch('/save', {
                method: 'POST'
            });
            const result = await response.json();
            alert(`Simulación guardada como: ${result.filename}`);
        } catch (error) {
            console.error('Error saving simulation:', error);
            alert('Error al guardar la simulación');
        }
    }

    async loadSimulation() {
        // To be implemented: Add file selection dialog
        alert('Funcionalidad de carga en desarrollo');
    }
}

// Initialize the simulation when the page loads
window.addEventListener('load', () => {
    window.simulation = new PetriNetSimulation();
});