from glob import glob
import numpy as np

data = []

for filename in glob('user7/session_0061629194'):
    with open(filename) as f:
        data.append(f.read().split())

data = np.array(data)
np.save('user7-session_0061629194.npy', data) # save