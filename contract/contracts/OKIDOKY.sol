// SPDX-License-Identifier: MIT

pragma solidity ^0.8.19;

import "hardhat/console.sol";

contract OKIDOKY {

    /*
    * NewAlarmイベントの作成
    */
    event NewAlarm(address indexed from, uint256 timestamp, string message);

    /*
     * ユーザーが送信したAlarmの情報
     */
    struct Alarm {
        address alarmer; // Alarmを送ったユーザーのアドレス
        string message; // ユーザーが送ったメッセージ
        uint256 timestamp; // ユーザーがAlarmを送った瞬間のタイムスタンプ
    }

    /*
     * ユーザーが送ってきた最新のAlarmを保持する
     */
    Alarm private _latestAlarm;

    constructor() {
        console.log("OKIDOKY - Smart Contract!");
    }

    /*
     * _messageという文字列を要求する
     * _messageは、ユーザーがフロントエンドから送信するメッセージ
     */
    function writeAlarm(string memory _message) public {
        console.log("%s alarmed w/ message %s", msg.sender, _message);

        /*
         * Alarmとメッセージを格納する
         */
        _latestAlarm = Alarm(msg.sender, _message, block.timestamp);

        /*
         * コントラクト側でemitされたイベントに関する通知をフロントエンドで取得する
         */
        emit NewAlarm(msg.sender, block.timestamp, _message);
    }

    function getLatestAlarm() public view returns (Alarm memory) {
        return _latestAlarm;
    }

}
