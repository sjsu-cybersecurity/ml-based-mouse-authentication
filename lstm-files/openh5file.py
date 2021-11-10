import numpy as np
myarray = np.fromfile('mouse_model_hdf.h5', dtype=float)
print(myarray)
"""
import h5py

f = h5py.File("mouser.h5")
for key in f.keys():
    print(key) #Names of the groups in HDF5 file.

#Get the HDF5 group
group = f[key]

#Checkout what keys are inside that group.
for key in group.keys():
    print(key)

data = group[model_weights][()]
#Do whatever you want with data

#After you are done
f.close()


import h5py

filename = "mouser.h5"

with h5py.File(filename, "r") as f:
    # List all groups
    print("Keys: %s" % f.keys())
    a_group_key = list(f.keys())[0]

    # Get the data
    data = list(f[a_group_key])
h5 = h5py.File(filename,'r')

model_weights = h5['model_weights']
optimizer_weights = h5['optimizer_weights']

h5.close()
"""