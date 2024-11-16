import random
import time
import os

# Characters for the curves
curves = ['╭', '╮', '╰', '╯']

try:
    while True:
        # Choose a random curve and print without a newline
        print(random.choice(curves), end='', flush=True)
        time.sleep(0.05)  # Optional: Add a slight delay for effect
except KeyboardInterrupt:
    # Gracefully handle exit on Ctrl+C
    print("\nExiting the curve generator!")
