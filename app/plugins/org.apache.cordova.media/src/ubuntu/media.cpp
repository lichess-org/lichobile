/*
 *
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 *
*/

#include "media.h"

void Media::create(int scId, int ecId, const QString &id, const QString &src) {
    Q_UNUSED(scId);
    Q_UNUSED(ecId);

    if (_id2Player.find(id) != _id2Player.end()) {
        _id2Player[id]->stop();
        _id2Player.remove(id);
    }

    _id2Player[id] = QSharedPointer<Player>(new Player(id, src, this));
}

void Media::relase(int scId, int ecId, const QString &id) {
    Q_UNUSED(scId);
    Q_UNUSED(ecId);

    if (_id2Player.find(id) == _id2Player.end())
        return;
    _id2Player.remove(id);
}

void Media::startPlayingAudio(int scId, int ecId, const QString &id, const QString &src, QVariantMap options) {
    Q_UNUSED(scId);
    Q_UNUSED(ecId);
    Q_UNUSED(src);
    Q_UNUSED(options);

    if (_id2Player.find(id) == _id2Player.end())
        return;
    QSharedPointer<Player> player = _id2Player[id];
    player->play();
}

void Media::pausePlayingAudio(int scId, int ecId, const QString &id) {
    Q_UNUSED(scId);
    Q_UNUSED(ecId);

    if (_id2Player.find(id) == _id2Player.end())
        return;
    QSharedPointer<Player> player = _id2Player[id];
    player->pause();
}

void Media::stopPlayingAudio(int scId, int ecId, const QString &id) {
    Q_UNUSED(scId);
    Q_UNUSED(ecId);

    if (_id2Player.find(id) == _id2Player.end())
        return;
    QSharedPointer<Player> player = _id2Player[id];
    player->stop();
}

void Media::startRecordingAudio(int scId, int ecId, const QString &id, const QString &src) {
    Q_UNUSED(scId);
    Q_UNUSED(ecId);
    Q_UNUSED(src);

    if (_id2Player.find(id) == _id2Player.end())
        return;
    QSharedPointer<Player> player = _id2Player[id];
    player->startRecording();
}

void Media::stopRecordingAudio(int scId, int ecId, const QString &id) {
    Q_UNUSED(scId);
    Q_UNUSED(ecId);

    if (_id2Player.find(id) == _id2Player.end())
        return;
    QSharedPointer<Player> player = _id2Player[id];
    player->stopRecording();
}

void Media::getCurrentPositionAudio(int scId, int ecId, const QString &id) {
    Q_UNUSED(ecId);

    if (_id2Player.find(id) == _id2Player.end())
        return;

    QSharedPointer<Player> player = _id2Player[id];
    double position = player->getPosition();
    this->cb(scId, position);
}

void Media::seekToAudio(int scId, int ecId, const QString &id, qint64 position) {
    Q_UNUSED(scId);
    Q_UNUSED(ecId);

    if (_id2Player.find(id) == _id2Player.end())
        return;

    QSharedPointer<Player> player = _id2Player[id];
    player->seekTo(position);
}

void Media::setVolume(int scId, int ecId, const QString &id, int volume) {
    Q_UNUSED(scId);
    Q_UNUSED(ecId);

    if (_id2Player.find(id) == _id2Player.end())
        return;
    QSharedPointer<Player> player = _id2Player[id];
    player->setVolume(volume);
}
