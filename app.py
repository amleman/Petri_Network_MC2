from flask import Flask, render_template, jsonify, request
import json
import os
from datetime import datetime

app = Flask(__name__)

class PetriNet:
    def __init__(self):
        # Initial state: Traffic lights 1 and 2 green, Traffic light 3 red (State 1)
        self.places = {
            'S1_Red': 0,    # Left side traffic light - Red
            'S1_Yellow': 0, # Left side traffic light - Yellow
            'S1_Green': 1,  # Left side traffic light - Green
            'S2_Red': 0,    # Right side traffic light - Red
            'S2_Yellow': 0, # Right side traffic light - Yellow
            'S2_Green': 1,  # Right side traffic light - Green
            'S3_Red': 1,    # Bottom traffic light - Red
            'S3_Yellow': 0, # Bottom traffic light - Yellow
            'S3_Green': 0   # Bottom traffic light - Green
        }
        
        self.current_state = 1  # Track current state (1-4)
        
    def get_state(self):
        return self.places
    
    def step(self):
        # Move to next state in sequence
        if self.current_state == 1:
            # Move to State 2: TL1&2 yellow, TL3 red
            self.places.update({
                'S1_Green': 0, 'S1_Yellow': 1, 'S1_Red': 0,
                'S2_Green': 0, 'S2_Yellow': 1, 'S2_Red': 0,
                'S3_Green': 0, 'S3_Yellow': 0, 'S3_Red': 1
            })
            self.current_state = 2
        elif self.current_state == 2:
            # Move to State 3: TL1&2 red, TL3 green
            self.places.update({
                'S1_Green': 0, 'S1_Yellow': 0, 'S1_Red': 1,
                'S2_Green': 0, 'S2_Yellow': 0, 'S2_Red': 1,
                'S3_Green': 1, 'S3_Yellow': 0, 'S3_Red': 0
            })
            self.current_state = 3
        elif self.current_state == 3:
            # Move to State 4: TL1&2 red, TL3 yellow
            self.places.update({
                'S1_Green': 0, 'S1_Yellow': 0, 'S1_Red': 1,
                'S2_Green': 0, 'S2_Yellow': 0, 'S2_Red': 1,
                'S3_Green': 0, 'S3_Yellow': 1, 'S3_Red': 0
            })
            self.current_state = 4
        else:  # current_state == 4
            # Move back to State 1: TL1&2 green, TL3 red
            self.places.update({
                'S1_Green': 1, 'S1_Yellow': 0, 'S1_Red': 0,
                'S2_Green': 1, 'S2_Yellow': 0, 'S2_Red': 0,
                'S3_Green': 0, 'S3_Yellow': 0, 'S3_Red': 1
            })
            self.current_state = 1
        return True
    
    def reset(self):
        self.__init__()

petri_net = PetriNet()

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/state')
def get_state():
    return jsonify(petri_net.get_state())

@app.route('/transition/next', methods=['POST'])
def next_transition():
    if petri_net.step():
        return jsonify({
            "status": "success",
            "state": petri_net.get_state()
        })
    return jsonify({
        "status": "error",
        "message": "No enabled transitions"
    })

@app.route('/reset', methods=['POST'])
def reset():
    petri_net.reset()
    return jsonify({
        "status": "success",
        "state": petri_net.get_state()
    })

@app.route('/save', methods=['POST'])
def save_simulation():
    state = {
        "places": petri_net.get_state(),
        "current_state": petri_net.current_state
    }
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"simulation_{timestamp}.json"
    
    if not os.path.exists('saves'):
        os.makedirs('saves')
        
    with open(os.path.join('saves', filename), 'w') as f:
        json.dump(state, f)
    return jsonify({"message": "Simulation saved", "filename": filename})

if __name__ == '__main__':
    if not os.path.exists('saves'):
        os.makedirs('saves')
    app.run(debug=True)