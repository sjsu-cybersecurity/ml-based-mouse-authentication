import numpy as np
import pandas as pd

#session_data = pd.read_csv("session_labels.csv")
#session_data_array= np.array(session_data)

X_val=np.load('mouse_movement_features.npy')
Y_val=np.load('mouse_movement_labels.npy')


from tensorflow.keras.layers import Input,Dense,Bidirectional,LSTM,ConvLSTM2D,GRU,Conv1D
from tensorflow.keras.models import Model,load_model
from tensorflow.keras.optimizers import Adam


inputs=Input((100,9))
#step=GRU(6)(inputs)
step=LSTM(6)(inputs)
#step=Bidirectional(LSTM(6))(inputs)
#step=Conv1D(6,kernel_size=5)(inputs)
pred=Dense(2)(step)

out_model=Model(inputs=inputs,outputs=pred)
out_model.compile(loss='sparse_categorical_crossentropy',
              optimizer=Adam(lr=2e-5),
              metrics=['accuracy'])
out_model.summary()


history = out_model.fit(x=X_val,y=Y_val,batch_size=16,epochs=10,validation_split=0.1)

#H5 file is a data file saved in the Hierarchical Data Format (HDF)
out_model.save('mouse_model_hdf.h5')

pred=out_model.predict(X_val[593][np.newaxis,:,:])
pred[0][0]

np.exp(0.26)/(np.exp(0.16)+0.26)


import matplotlib.pyplot as plt
"""
fig=plt.figure(figsize=[20,10])
axis1=fig.add_subplot(121)
axis2=fig.add_subplot(122)
axis1.plot(X_val[1,:,0],X_val[1,:,1])
axis2.plot(X_val[593,:,0],X_val[593,:,1])
plt.show()
"""

# Plot the loss and accuracy curves for training and validation
plt.plot(history.history['val_loss'], color='b', label="validation loss")
plt.title("Test Loss")
plt.xlabel("Number of Epochs")
plt.ylabel("Loss")
plt.legend()
plt.show()

# confusion matrix
from sklearn.metrics import confusion_matrix
import seaborn as sns
# Predict the values from the validation dataset
Y_pred = out_model.predict(X_val)
# Convert predictions classes to one hot vectors
Y_pred_classes = np.argmax(Y_pred,axis = 1)
# Convert validation observations to one hot vectors
Y_true = np.argmax(Y_val,axis = 1)
# compute the confusion matrix
confusion_mtx = confusion_matrix(Y_true, Y_pred_classes)
# plot the confusion matrix
f,ax = plt.subplots(figsize=(8, 8))
sns.heatmap(confusion_mtx, annot=True, linewidths=0.01,cmap="Greens",linecolor="gray", fmt= '.1f',ax=ax)
plt.xlabel("Predicted Label")
plt.ylabel("True Label")
plt.title("Confusion Matrix")
plt.show()