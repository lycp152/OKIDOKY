// SPDX-License-Identifier: MIT

pragma solidity ^0.8.19;

import "hardhat/console.sol";

contract OKIDOKY {

    /*
    * AlarmStopイベントの作成
    */
    event AlarmStop(address indexed from, uint256 timestamp, string message);

    /*
     * ユーザーが送信したAlarmの情報
     */
    struct Alarm {
        address user; // Alarmを送ったユーザーのアドレス
        string message; // ユーザーが送ったメッセージ
        uint256 timestamp; // ユーザーがAlarmを送った瞬間のタイムスタンプ
    }

    /*
     * 構造体の配列を格納するための変数alarmsを宣言する
     * ユーザーが送ってきた最新のAlarmを保持する
     */
    Alarm[] private _alarms;

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
         * Alarmとメッセージを配列に格納する
         */
        _alarms.push(Alarm(msg.sender, _message, block.timestamp));

        /*
         * コントラクト側でemitされたイベントに関する通知をフロントエンドで取得する
         */
        emit AlarmStop(msg.sender, block.timestamp, _message);
    }

    function getAlarmHistory() public view returns (Alarm[] memory) {
        return _alarms;
    }

}
