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

#ifndef MEDIA_H_789768978
#define MEDIA_H_789768978

#include <QtMultimedia/QMediaPlayer>
#include <QtCore>
#include <QAudioRecorder>
#include <QtMultimedia/QAudioEncoderSettings>

#include <cplugin.h>
#include <cordova.h>

class Player;

class Media: public CPlugin {
    Q_OBJECT
public:
    explicit Media(Cordova *cordova): CPlugin(cordova) {
    }

    virtual const QString fullName() override {
        return Media::fullID();
    }

    virtual const QString shortName() override {
        return "Media";
    }

    static const QString fullID() {
        return "Media";
    }

    enum State {
        MEDIA_NONE = 0,
        MEDIA_STARTING = 1,
        MEDIA_RUNNING = 2,
        MEDIA_PAUSED = 3,
        MEDIA_STOPPED = 4
    };
    enum ErrorCode {
        MEDIA_ERR_NONE_ACTIVE = 0,
        MEDIA_ERR_ABORTED = 1,
        MEDIA_ERR_NETWORK = 2,
        MEDIA_ERR_DECODE = 3,
        MEDIA_ERR_NONE_SUPPORTED = 4
    };

    void execJS(const QString &js) {
        m_cordova->execJS(js);
    }
public slots:
    void create(int scId, int ecId, const QString &id, const QString &src);
    void relase(int scId, int ecId, const QString &id);

    void startRecordingAudio(int scId, int ecId, const QString &id, const QString &src);
    void stopRecordingAudio(int scId, int ecId, const QString &id);

    void startPlayingAudio(int scId, int ecId, const QString &id, const QString &src, QVariantMap options);
    void pausePlayingAudio(int scId, int ecId, const QString &id);
    void stopPlayingAudio(int scId, int ecId, const QString &id);
    void getCurrentPositionAudio(int scId, int ecId, const QString &id);
    void seekToAudio(int scId, int ecId, const QString &id, qint64 position);
    void setVolume(int scId, int ecId, const QString &id, int volume);

private:
    QMap<QString, QSharedPointer<Player> > _id2Player;
};

class Player: public QObject {
    Q_OBJECT
public:
    Player(const QString &id, QString src, Media *plugin):
        _state(Media::MEDIA_NONE),
        _src(src),
        _mode(MODE_NONE),
        _plugin(plugin),
        _id(id),
        _stateChanged(false) {
        QUrl url(src, QUrl::TolerantMode);

        if (url.scheme().isEmpty()) {
            QAudioEncoderSettings audioSettings;

            _recorder.setEncodingSettings(audioSettings);
            _recorder.setOutputLocation(QFileInfo(src).absoluteFilePath());

            _player.setMedia(QUrl::fromLocalFile(QFileInfo(src).absoluteFilePath()));
        } else {
            _player.setMedia(url);
        }
        QObject::connect(&_player, SIGNAL(mediaStatusChanged(QMediaPlayer::MediaStatus)), this, SLOT(onMediaStatusChanged(QMediaPlayer::MediaStatus)));
        QObject::connect(&_recorder, SIGNAL(error(QMediaRecorder::Error)), this, SLOT(onError(QMediaRecorder::Error)));

        connect(&_timer, SIGNAL(timeout()), this, SLOT(reportPosition()));
    }

    void startRecording() {
        if (recordMode() && _state != Media::MEDIA_RUNNING) {
            _recorder.record();
            setState(Media::MEDIA_RUNNING);
        }
    }
    void stopRecording() {
        if (recordMode() && _state == Media::MEDIA_RUNNING) {
            _recorder.stop();
            setState(Media::MEDIA_STOPPED);
        }
    }

    void setVolume(int volume) {
        _player.setVolume(volume);
    }

    void play() {
        if (playMode() && _state != Media::MEDIA_RUNNING) {
            _player.play();
            setState(Media::MEDIA_RUNNING);
        }
    }
    void pause() {
        if (playMode() && _state == Media::MEDIA_RUNNING) {
            _player.pause();
            setState(Media::MEDIA_PAUSED);
        }
    }
    void stop() {
        if (playMode() && (_state == Media::MEDIA_RUNNING || _state == Media::MEDIA_PAUSED)) {
            _player.stop();
            setState(Media::MEDIA_STOPPED);
        }
    }
    double getDuration() {
        if (_mode == MODE_NONE || _player.duration() == -1)
            return -1;
        if (_mode != MODE_PLAY)
            return -2;
        return static_cast<double>(_player.duration()) / 1000.0;
    }
    double getPosition() {
        if (_mode != MODE_PLAY)
            return -1;
        return static_cast<double>(_player.position()) / 1000.0;
    }
    bool seekTo(qint64 position) {
        if (!_player.isSeekable())
            return false;
        _player.setPosition(position * 1000);
        return true;
    }
private slots:
    void reportPosition() {
        double position = getPosition();
        _plugin->execJS(QString("Media.onStatus('%1', Media.MEDIA_POSITION, %2)")
                        .arg(_id).arg(position));
        double duration = getDuration();
        _plugin->execJS(QString("Media.onStatus('%1', Media.MEDIA_DURATION, %2)")
                        .arg(_id).arg(duration));

        if (_stateChanged && !(_state == Media::MEDIA_RUNNING && (duration == -1 || position == 0))) {
        qCritical() << _id << "POSITION" << position << ":" << duration;
            _stateChanged = false;
            _plugin->execJS(QString("Media.onStatus('%1', Media.MEDIA_STATE, %2)").arg(_id).arg(_state));
        }
    }

    void onMediaStatusChanged(QMediaPlayer::MediaStatus status) {
        if (status == QMediaPlayer::InvalidMedia) {
            reportError(Media::MEDIA_ERR_ABORTED, "AudioPlayer Error: The current media cannot be played.");
            setState(Media::MEDIA_STOPPED);
        }
        if (status == QMediaPlayer::EndOfMedia) {
            setState(Media::MEDIA_STOPPED);
            seekTo(0);
        }
    }
    void onError(QMediaRecorder::Error) {
        reportError(Media::MEDIA_ERR_NONE_SUPPORTED, "AudioPlayer Error: Device is not ready or not available.");
        setState(Media::MEDIA_STOPPED);
    }

private:
    void reportError(int code, const QString &descr) {
        Q_UNUSED(descr);
        _plugin->execJS(QString("Media.onStatus('%1', Media.MEDIA_ERROR, {code: %2})")
                        .arg(_id).arg(code));
    }

    bool playMode() {
        switch (_mode) {
        case Player::MODE_NONE:
            _mode = MODE_PLAY;
            break;
        case Player::MODE_PLAY:
            break;
        case Player::MODE_RECORD:
            reportError(Media::MEDIA_ERR_NONE_SUPPORTED, "AudioPlayer Error: Can't play in record mode.");
            return false;
            break;
        }
        return true;
    }

    bool recordMode() {
        switch (_mode) {
        case Player::MODE_NONE:
            if (_recorder.outputLocation().isEmpty()) {
                reportError(Media::MEDIA_ERR_NONE_SUPPORTED, "AudioPlayer Error: unsupported output location.");
                return false;
            }
            _mode = MODE_RECORD;
            break;
        case Player::MODE_PLAY:
            reportError(Media::MEDIA_ERR_NONE_SUPPORTED, "AudioPlayer Error: Can't play in play mode.");
            return false;
            break;
        case Player::MODE_RECORD:
            break;
        }
        return true;
    }

    void setState(Media::State state) {
        _state = state;
        _stateChanged = true;
        _timer.start(250);
    }

    QMediaPlayer _player;

    QAudioRecorder _recorder;
    QTimer _timer;

    Media::State _state;
    QString _src;
    enum Mode {
        MODE_NONE,
        MODE_PLAY,
        MODE_RECORD
    };
    Mode _mode;
    Media *_plugin;
    QString _id;

    bool _stateChanged;
};

#endif
