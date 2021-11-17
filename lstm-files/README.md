In order to execute LSTM based scripts, u need the following files:
1. malicioususerandbotdetect.py
2. mouse_movement_features.npy
3. mouse_movement_labels.npy

Command to execute bidirectional LSTM model training which results in accuracy, loss and confusion matrices:

```
python3  malicioususerandbotdetect.py
```

Sample output:

```
Model: "model"
_________________________________________________________________
Layer (type)                 Output Shape              Param #
=================================================================
input_1 (InputLayer)         [(None, 100, 9)]          0
_________________________________________________________________
bidirectional (Bidirectional (None, 12)                768
_________________________________________________________________
dense (Dense)                (None, 2)                 26
=================================================================
Total params: 794
Trainable params: 794
Non-trainable params: 0
_________________________________________________________________
2021-11-17 00:09:19.389884: I tensorflow/compiler/mlir/mlir_graph_optimization_pass.cc:185] None of the MLIR Optimization Passes are enabled (registered 2)
Epoch 1/10
34/34 [==============================] - 5s 56ms/step - loss: 0.2973 - accuracy: 0.8872 - val_loss: 0.2012 - val_accuracy: 0.9672
Epoch 2/10
34/34 [==============================] - 1s 36ms/step - loss: 0.1160 - accuracy: 0.9871 - val_loss: 0.0962 - val_accuracy: 0.9836
Epoch 3/10
34/34 [==============================] - 1s 38ms/step - loss: 0.0538 - accuracy: 0.9945 - val_loss: 0.0671 - val_accuracy: 0.9836
Epoch 4/10
34/34 [==============================] - 1s 43ms/step - loss: 0.0376 - accuracy: 0.9945 - val_loss: 0.0576 - val_accuracy: 0.9836
Epoch 5/10
34/34 [==============================] - 1s 42ms/step - loss: 0.0311 - accuracy: 0.9982 - val_loss: 0.0533 - val_accuracy: 0.9836
Epoch 6/10
34/34 [==============================] - 1s 35ms/step - loss: 0.0266 - accuracy: 0.9982 - val_loss: 0.0497 - val_accuracy: 0.9836
Epoch 7/10
34/34 [==============================] - 1s 34ms/step - loss: 0.0239 - accuracy: 0.9982 - val_loss: 0.0471 - val_accuracy: 0.9836
Epoch 8/10
34/34 [==============================] - 1s 34ms/step - loss: 0.0217 - accuracy: 0.9982 - val_loss: 0.0443 - val_accuracy: 0.9836
Epoch 9/10
34/34 [==============================] - 1s 30ms/step - loss: 0.0194 - accuracy: 1.0000 - val_loss: 0.0418 - val_accuracy: 0.9836
Epoch 10/10
34/34 [==============================] - 1s 29ms/step - loss: 0.0170 - accuracy: 1.0000 - val_loss: 0.0397 - val_accuracy: 0.9836
```

