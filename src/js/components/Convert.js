import React, { useState, useEffect } from 'react';
import {
  Select,
  Layout,
  Button,
  Upload,
  Modal,
  notification,
  Input,
} from 'antd';
import { InboxOutlined } from '@ant-design/icons';
const { Dragger } = Upload;
import 'antd/dist/antd.css';
const { Content } = Layout;
const { Option } = Select;
import './style.scss';
const videoList = [
  'mp4',
  'm3u8',
  'avi',
  'wmv',
  'mpeg',
  'm4v',
  'mov',
  'asf',
  'flv',
  'f4v',
  'webm',
  'ogg',
  'mp3',
  'wav',
  'aif',
  'flac',
];

const audioList = ['mp3', 'wav', 'aif', 'flac', 'ogg'];

const Convert = () => {
  const [chooseFilesPathList, setChooseFilesPathList] = useState([]);
  const [modelInfo, setModelInfo] = useState({});
  const [downloadPath, setDownloadPath] = useState('');
  const [init, setInit] = useState(false);
  const props = {
    name: 'file',
    multiple: true,
    showUploadList: false,
    accept: 'audio/*, video/*',
    beforeUpload(file, fileList) {
      const list = fileList.map((f) => ({
        name: f.name,
        path: f.path,
        start: false,
      }));
      setList(list);
    },
    onDrop(e) {
      const { files } = e.dataTransfer;
      if (files.length === 1 && files[0].type.length === 0) {
        readDirectory(files[0]);
      } else {
        setList({ name: files[0].name, path: files[0].path, start: false });
      }
    },
  };
  function readDirectory(dir) {
    const { path } = dir;
    if (!path) {
      return null;
    }
    electron.directoryApi.sendDirPath(path);
  }
  electron.removerAllApi.remove();
  electron.statusApi.end((fileInfo) => {
    let newList = [...chooseFilesPathList];
    newList = newList.map((i) => {
      if (i.path === fileInfo.path) {
        fileInfo.complete = true;
        fileInfo.type = fileInfo.type;
        i.type = fileInfo.type;
        return fileInfo;
      } else {
        return i;
      }
    });
    setChooseFilesPathList(newList);
  });
  electron.directoryApi.getDirFilesPath((filesList) => {
    const list = filesList
      .map((f) => {
        if (videoList.some((v) => f.name.endsWith(v))) {
          return f;
        }
        return false;
      })
      .filter((f) => f);
    setList(list);
  });
  if (downloadPath.length === 0) {
    electron.directoryApi.getDownLoadFilePath(() => {});
  }

  electron.directoryApi.receiveDownloadDirectory((path) => {
    setDownloadPath(path);
  });

  useEffect(() => {
    if (chooseFilesPathList.length) {
      setInit(true);
    }
  }, [chooseFilesPathList]);

  function setList(path) {
    let list = [];
    if (Array.isArray(path)) {
      path.forEach((p) => {
        if (chooseFilesPathList.every((c) => c.path !== p.path)) {
          list.push(p);
        }
      });
    } else {
      if (chooseFilesPathList.every((c) => c.path !== path.path)) {
        list.push(path);
      }
    }
    list = [...chooseFilesPathList, ...list];
    setChooseFilesPathList(list);
  }
  function handleOk() {
    let list = [...chooseFilesPathList];
    list = list.filter((l) => l.name !== modelInfo.name);
    setChooseFilesPathList(list);
    setModelInfo({});
  }
  function handleCancel() {
    setModelInfo({});
  }
  function handleConvert(item) {
    let list = [...chooseFilesPathList];
    list.map((l) => {
      if (l.name === item.name) {
        l.start = true;
        l.type = item.type;
      }
      return l;
    });
    setChooseFilesPathList(list);
    electron.filesApi.sendFilePath(item);
  }
  function handleCoveredAll() {
    chooseFilesPathList.forEach((p) => {
      if (p.start === false) {
        handleConvert(p);
      }
    });
  }
  function handleCoveredClear() {
    if (chooseFilesPathList.some((p) => p.start === true)) {
      notification.open({
        description: '?????????????????????????????????',
      });
    } else {
      setChooseFilesPathList([]);
    }
  }
  function renderModel() {
    return (
      <Modal visible={modelInfo.name} onOk={handleOk} onCancel={handleCancel}>
        ???????????????{modelInfo.name}
      </Modal>
    );
  }
  function renderChooseList() {
    return (
      <div className="table">
        <div className="table-header">
          <span>?????????????????????</span>
          <span>????????????</span>
          <span>??????</span>
        </div>
        <div className="table-content">
          {chooseFilesPathList.map((l, i) => {
            let list = videoList;
            if (audioList.some((a) => l.name.endsWith(a))) {
              list = audioList;
            }
            l.type = l.type ? l.type : list[0];
            return (
              <div key={l.name} className="table-content-item">
                <div>{l.name}</div>
                <div>
                  <Select
                    key={list[0]}
                    defaultValue={l.type}
                    onChange={(t) => {
                      let list = [...chooseFilesPathList].map((p) => {
                        if (p.path === l.path) {
                          p.type = t;
                        }
                        return p;
                      });
                      setChooseFilesPathList(list);
                    }}
                    disabled={!!l.start || l.isCompleted}
                  >
                    {list.map((t) => (
                      <Option value={t} key={t}>
                        {t}
                      </Option>
                    ))}
                  </Select>
                </div>
                <div>
                  {l.start === false ? (
                    <Button onClick={() => setModelInfo(l)}>??????</Button>
                  ) : (
                    ''
                  )}
                  <Button
                    onClick={() => handleConvert(l)}
                    disabled={l.start !== false}
                  >
                    {l.start === false
                      ? '??????'
                      : l.start === true
                      ? '?????????'
                      : '????????????'}
                  </Button>
                </div>
              </div>
            );
          })}
          {chooseFilesPathList.length === 0 ? (
            <div className="empty">?????????????????????</div>
          ) : (
            ''
          )}
        </div>
      </div>
    );
  }
  return (
    <div className="main">
      <Layout>
        <Content>
          <div className="preview">
            <Dragger {...props}>
              <p className="ant-upload-drag-icon">
                <InboxOutlined />
              </p>
              <p className="ant-upload-text">Click or drag file to this area</p>
            </Dragger>
          </div>
          {init ? (
            <div>
              {renderChooseList()}
              <div className="save">
                <Button onClick={() => handleCoveredAll()}>????????????</Button>
                <Button onClick={() => handleCoveredClear()}>????????????</Button>
                <div>????????????:</div>
                <Input
                  placeholder={`??????????????????${downloadPath}`}
                  onMouseDown={() => {
                    electron.changeDirectory.selectDirectory();
                  }}
                  value={downloadPath}
                />
              </div>
            </div>
          ) : (
            ''
          )}
        </Content>
      </Layout>
      {renderModel()}
    </div>
  );
};

export default Convert;
