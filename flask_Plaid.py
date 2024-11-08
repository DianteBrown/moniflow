import logging
from flask import Flask, jsonify
import plaid_integration  # Import your Plaid functions

# Configure logging for better traceability
logging.basicConfig(level=logging.DEBUG, format='%(asctime)s - %(levelname)s - %(message)s')

app = Flask(__name__)

@app.route('/create-link-token', methods=['GET'])
def create_link_token_route():
    try:
        logging.info("Attempting to create a link token...")
        link_token = plaid_integration.create_link_token()
        if not link_token:
            raise ValueError("Link token creation returned None")
        logging.info("Link token created successfully")
        return jsonify({'link_token': link_token})
    except ImportError as e:
        logging.error("Import error occurred: %s", e)
        return jsonify({'error': 'Import error: Ensure all necessary libraries are installed'}), 500
    except ValueError as e:
        logging.error("Value error: %s", e)
        return jsonify({'error': f'Value error: {str(e)}'}), 500
    except Exception as e:
        logging.error("An unexpected error occurred: %s", e)
        return jsonify({'error': f'Unexpected error: {str(e)}'}), 500

if __name__ == '__main__':
    try:
        app.run(port=8002)
        logging.info("Flask server started successfully on port 8002")
    except OSError as e:
        logging.error("Port error: %s. Ensure the port is not in use or choose a different port.", e)
    except Exception as e:
        logging.critical("Failed to start the Flask server: %s", e)