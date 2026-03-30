"use strict";

var __sessionBookmarkDictionary = {};
var __currentUniqueID = 0;

class SessionBookmarks
{
    get Bookmarks()
    {
        var file = this.Attributes.Target.Details.DumpFileName;
        if (!(file in __sessionBookmarkDictionary))
        {
            __sessionBookmarkDictionary[file] = new BookmarkCollection;
        }
        
        return __sessionBookmarkDictionary[file];
    }
}

class Bookmark
{
    constructor(collection, name, category, timestamp)
    {
        if (timestamp.Sequence === undefined || timestamp.Steps === undefined)
        {
            throw "Bookmark must be added at a valid timestamp";
        }
        this.__collection = collection;
        this.__name = name;
        this.__category = category;
        this.__timestamp = timestamp;
        this.UniqueID = __currentUniqueID++;
    }

    get Name()
    {
        return this.__name;
    }

    set Name(value)
    {
        this.__name = value;
    }

    get Timestamp()
    {
        return this.__timestamp;
    }

    set Timestamp(value)
    {
        this.__timestamp = value;
    }

    get Category()
    {
        return this.__category;
    }

    set Category(value)
    {
        this.__category = value;
    }

    Remove()
    {
        this.__collection.__Remove(this);
    }

    toString()
    {
        if (this.Name === undefined)
        {
            return "Bookmark: " + this.__timestamp.toString();
        }
        return "Bookmark: " + this.Name;
    }
}

class BookmarkCollection
{
    constructor()
    {
        this.__bookmarks = [];
    }
    
    AddBookmark(name, category, timestamp)
    {
        if (timestamp === undefined)
        {
            // We could add a bookmark from the wrong session if the current thread doesn't belong to this session.
            // You'd have to jump through hoops to get to there, so I'll leave that as a problem for later
            timestamp = host.currentThread.TTD.Position;
        }
        if (category === undefined)
        {
            category = "bookmark";
        }
        // It's ok for name to be undefined, we'll just use the timestamp for a display string
        this.__bookmarks.push(new Bookmark(this, name, category, timestamp));
    }

    DeleteBookmarkByID(id)
    {
        this.__bookmarks = this.__bookmarks.filter(b => b.UniqueID !== id);
    }

    __Remove(bookmark)
    {
        for( var i = 0; i < this.__bookmarks.length; i++)
        {
            if (this.__bookmarks[i] === bookmark)
            {
                this.__bookmarks.splice(i, 1);
                return;
            }
        }
    }

    *[Symbol.iterator]()
    {
        yield* this.__bookmarks;
    }

    SaveAsJson()
    {
        var serialBookmarks = this.__bookmarks.map(
            x => 
            {
                return {
                    Name: x.Name,
                    Category: x.Category,
                    Sequence: x.Timestamp.Sequence.asNumber(),
                    Steps: x.Timestamp.Steps.asNumber()
                };
            }
        )
        return JSON.stringify(serialBookmarks);
    }

    LoadFromJson(jsonBookmarks)
    {
        var create = host.namespace.Debugger.Utility.Objects.CreateInstance;
        var serialBookmarks = JSON.parse(jsonBookmarks);
        this.__bookmarks = serialBookmarks.map(
            x => new Bookmark(this, x.Name, x.Category, create("Debugger.Models.TTD.Position", x.Sequence, x.Steps))
        )
    }

    toString()
    {
        return "Bookmark collection";
    }
}

function initializeScript()
{
    return [new host.namespacePropertyParent(SessionBookmarks, "Debugger.Models.Session", "TTDAnalyze", "TTD"),
            new host.apiVersionSupport(1, 3)];
}

// SIG // Begin signature block
// SIG // MIIoUAYJKoZIhvcNAQcCoIIoQTCCKD0CAQExDzANBglg
// SIG // hkgBZQMEAgEFADB3BgorBgEEAYI3AgEEoGkwZzAyBgor
// SIG // BgEEAYI3AgEeMCQCAQEEEBDgyQbOONQRoqMAEEvTUJAC
// SIG // AQACAQACAQACAQACAQAwMTANBglghkgBZQMEAgEFAAQg
// SIG // 7aX/GnuE6sGgPGKORLPLKTHYvWdrVZaKCX07IVOuL/ig
// SIG // gg2FMIIGAzCCA+ugAwIBAgITMwAABISY4hLgeKMxXQAA
// SIG // AAAEhDANBgkqhkiG9w0BAQsFADB+MQswCQYDVQQGEwJV
// SIG // UzETMBEGA1UECBMKV2FzaGluZ3RvbjEQMA4GA1UEBxMH
// SIG // UmVkbW9uZDEeMBwGA1UEChMVTWljcm9zb2Z0IENvcnBv
// SIG // cmF0aW9uMSgwJgYDVQQDEx9NaWNyb3NvZnQgQ29kZSBT
// SIG // aWduaW5nIFBDQSAyMDExMB4XDTI1MDYxOTE4MjEzNVoX
// SIG // DTI2MDYxNzE4MjEzNVowdDELMAkGA1UEBhMCVVMxEzAR
// SIG // BgNVBAgTCldhc2hpbmd0b24xEDAOBgNVBAcTB1JlZG1v
// SIG // bmQxHjAcBgNVBAoTFU1pY3Jvc29mdCBDb3Jwb3JhdGlv
// SIG // bjEeMBwGA1UEAxMVTWljcm9zb2Z0IENvcnBvcmF0aW9u
// SIG // MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA
// SIG // 7XpKjCg5837MnNU9UKR3xba/q5Iq/JXcyzypjF20Q6Ll
// SIG // VwLLwX3ehPNrT4+GM2kpbhg0KF9zaTCqKCnlRY4zUat+
// SIG // 8sk/4dUEyzAfHaZrGf+9FDPlP7GMb7dT1lsS4zDSF6sw
// SIG // fD4xuoux9mBYJOGDoXxknpL581td3SwLX4w9MIsERD7w
// SIG // jZYpUc+16BXXuSjtNXhYlnrXoePKlDqlGgJCM5wuFwd7
// SIG // BXdS1lJrqVxytOUHyUpp3ovamSQWE7fGYQKxg4e50J/m
// SIG // NYzgN6AYglCeJ9QjGlnQ4a4HTLrtNuqFgG3wt6a6pFJ/
// SIG // C1qdvB/tki3rTRuSkGWcL8t2XJ+/j0BpeQIDAQABo4IB
// SIG // gjCCAX4wHwYDVR0lBBgwFgYKKwYBBAGCN0wIAQYIKwYB
// SIG // BQUHAwMwHQYDVR0OBBYEFATf9G+hYepzHROBQMWBvZFg
// SIG // qW2FMFQGA1UdEQRNMEukSTBHMS0wKwYDVQQLEyRNaWNy
// SIG // b3NvZnQgSXJlbGFuZCBPcGVyYXRpb25zIExpbWl0ZWQx
// SIG // FjAUBgNVBAUTDTIzMDAxMis1MDUzNjIwHwYDVR0jBBgw
// SIG // FoAUSG5k5VAF04KqFzc3IrVtqMp1ApUwVAYDVR0fBE0w
// SIG // SzBJoEegRYZDaHR0cDovL3d3dy5taWNyb3NvZnQuY29t
// SIG // L3BraW9wcy9jcmwvTWljQ29kU2lnUENBMjAxMV8yMDEx
// SIG // LTA3LTA4LmNybDBhBggrBgEFBQcBAQRVMFMwUQYIKwYB
// SIG // BQUHMAKGRWh0dHA6Ly93d3cubWljcm9zb2Z0LmNvbS9w
// SIG // a2lvcHMvY2VydHMvTWljQ29kU2lnUENBMjAxMV8yMDEx
// SIG // LTA3LTA4LmNydDAMBgNVHRMBAf8EAjAAMA0GCSqGSIb3
// SIG // DQEBCwUAA4ICAQBi0KbNV1OEU3KAyAyz+kBtzZ0RN6f1
// SIG // kjKetQrPGfiVL98SVhrQc2JgiDZh1Rb+ovKWBf3u/RTS
// SIG // uj9aCo3bsah0onAXYPDI9JPJAxQP9HlNumzwUUFCGolq
// SIG // 4bAzq11nS5u2ZrudeqEKFFnCDbOIwX4wxFVeG5oEGH3v
// SIG // uPzFCcECfYepnxPpHAj+B5T+AoSEAVB6EspmpHEwb2cP
// SIG // kLLe7G3beSp0CpEhDdNQszxtWsApQiOsyyn/7yiMJ6h8
// SIG // P/lr3AK+4MCpVjZi8EzYvNO6/a1rF0HqdUPGDJCLhpmd
// SIG // GtagndxrjpEkc589v9KI3mVWIWcqIQkItQbPsX0ZL/38
// SIG // tB31d5jcjttnRVLx8wWYKhORWxo5lJ60q9cfJQqyvrOA
// SIG // PmzhqdiHozqYVqGRDxjnKPxxM52eS5OsOlvhNictzx6B
// SIG // RNGPE7ZEhOP/NGNpQSYS49u3fLnifCHUIUqS/1s04457
// SIG // mB+w8eaPaVnSBkmhTWLkqjmMa1VuzeABEFUQ2Xqg3H6j
// SIG // xtzuq+UjbMV23e9QwiEFEbVCrLOdzjfr65VdK44igSHc
// SIG // LzDS0PcytI8u+6MA8l16GJEMWpDdrhSATtVDQLwmF47O
// SIG // K8N0kZgV/aomeRDcXJ/6SzJIsm+vEHcB1F8/tXyOnmt/
// SIG // 446TT8+g5XP0THFyFnjDJIbqf1xG8Lu91Prs/zCCB3ow
// SIG // ggVioAMCAQICCmEOkNIAAAAAAAMwDQYJKoZIhvcNAQEL
// SIG // BQAwgYgxCzAJBgNVBAYTAlVTMRMwEQYDVQQIEwpXYXNo
// SIG // aW5ndG9uMRAwDgYDVQQHEwdSZWRtb25kMR4wHAYDVQQK
// SIG // ExVNaWNyb3NvZnQgQ29ycG9yYXRpb24xMjAwBgNVBAMT
// SIG // KU1pY3Jvc29mdCBSb290IENlcnRpZmljYXRlIEF1dGhv
// SIG // cml0eSAyMDExMB4XDTExMDcwODIwNTkwOVoXDTI2MDcw
// SIG // ODIxMDkwOVowfjELMAkGA1UEBhMCVVMxEzARBgNVBAgT
// SIG // Cldhc2hpbmd0b24xEDAOBgNVBAcTB1JlZG1vbmQxHjAc
// SIG // BgNVBAoTFU1pY3Jvc29mdCBDb3Jwb3JhdGlvbjEoMCYG
// SIG // A1UEAxMfTWljcm9zb2Z0IENvZGUgU2lnbmluZyBQQ0Eg
// SIG // MjAxMTCCAiIwDQYJKoZIhvcNAQEBBQADggIPADCCAgoC
// SIG // ggIBAKvw+nIQHC6t2G6qghBNNLrytlghn0IbKmvpWlCq
// SIG // uAY4GgRJun/DDB7dN2vGEtgL8DjCmQawyDnVARQxQtOJ
// SIG // DXlkh36UYCRsr55JnOloXtLfm1OyCizDr9mpK656Ca/X
// SIG // llnKYBoF6WZ26DJSJhIv56sIUM+zRLdd2MQuA3WraPPL
// SIG // bfM6XKEW9Ea64DhkrG5kNXimoGMPLdNAk/jj3gcN1Vx5
// SIG // pUkp5w2+oBN3vpQ97/vjK1oQH01WKKJ6cuASOrdJXtjt
// SIG // 7UORg9l7snuGG9k+sYxd6IlPhBryoS9Z5JA7La4zWMW3
// SIG // Pv4y07MDPbGyr5I4ftKdgCz1TlaRITUlwzluZH9TupwP
// SIG // rRkjhMv0ugOGjfdf8NBSv4yUh7zAIXQlXxgotswnKDgl
// SIG // mDlKNs98sZKuHCOnqWbsYR9q4ShJnV+I4iVd0yFLPlLE
// SIG // tVc/JAPw0XpbL9Uj43BdD1FGd7P4AOG8rAKCX9vAFbO9
// SIG // G9RVS+c5oQ/pI0m8GLhEfEXkwcNyeuBy5yTfv0aZxe/C
// SIG // HFfbg43sTUkwp6uO3+xbn6/83bBm4sGXgXvt1u1L50kp
// SIG // pxMopqd9Z4DmimJ4X7IvhNdXnFy/dygo8e1twyiPLI9A
// SIG // N0/B4YVEicQJTMXUpUMvdJX3bvh4IFgsE11glZo+TzOE
// SIG // 2rCIF96eTvSWsLxGoGyY0uDWiIwLAgMBAAGjggHtMIIB
// SIG // 6TAQBgkrBgEEAYI3FQEEAwIBADAdBgNVHQ4EFgQUSG5k
// SIG // 5VAF04KqFzc3IrVtqMp1ApUwGQYJKwYBBAGCNxQCBAwe
// SIG // CgBTAHUAYgBDAEEwCwYDVR0PBAQDAgGGMA8GA1UdEwEB
// SIG // /wQFMAMBAf8wHwYDVR0jBBgwFoAUci06AjGQQ7kUBU7h
// SIG // 6qfHMdEjiTQwWgYDVR0fBFMwUTBPoE2gS4ZJaHR0cDov
// SIG // L2NybC5taWNyb3NvZnQuY29tL3BraS9jcmwvcHJvZHVj
// SIG // dHMvTWljUm9vQ2VyQXV0MjAxMV8yMDExXzAzXzIyLmNy
// SIG // bDBeBggrBgEFBQcBAQRSMFAwTgYIKwYBBQUHMAKGQmh0
// SIG // dHA6Ly93d3cubWljcm9zb2Z0LmNvbS9wa2kvY2VydHMv
// SIG // TWljUm9vQ2VyQXV0MjAxMV8yMDExXzAzXzIyLmNydDCB
// SIG // nwYDVR0gBIGXMIGUMIGRBgkrBgEEAYI3LgMwgYMwPwYI
// SIG // KwYBBQUHAgEWM2h0dHA6Ly93d3cubWljcm9zb2Z0LmNv
// SIG // bS9wa2lvcHMvZG9jcy9wcmltYXJ5Y3BzLmh0bTBABggr
// SIG // BgEFBQcCAjA0HjIgHQBMAGUAZwBhAGwAXwBwAG8AbABp
// SIG // AGMAeQBfAHMAdABhAHQAZQBtAGUAbgB0AC4gHTANBgkq
// SIG // hkiG9w0BAQsFAAOCAgEAZ/KGpZjgVHkaLtPYdGcimwuW
// SIG // EeFjkplCln3SeQyQwWVfLiw++MNy0W2D/r4/6ArKO79H
// SIG // qaPzadtjvyI1pZddZYSQfYtGUFXYDJJ80hpLHPM8QotS
// SIG // 0LD9a+M+By4pm+Y9G6XUtR13lDni6WTJRD14eiPzE32m
// SIG // kHSDjfTLJgJGKsKKELukqQUMm+1o+mgulaAqPyprWElj
// SIG // HwlpblqYluSD9MCP80Yr3vw70L01724lruWvJ+3Q3fMO
// SIG // r5kol5hNDj0L8giJ1h/DMhji8MUtzluetEk5CsYKwsat
// SIG // ruWy2dsViFFFWDgycScaf7H0J/jeLDogaZiyWYlobm+n
// SIG // t3TDQAUGpgEqKD6CPxNNZgvAs0314Y9/HG8VfUWnduVA
// SIG // KmWjw11SYobDHWM2l4bf2vP48hahmifhzaWX0O5dY0Hj
// SIG // Wwechz4GdwbRBrF1HxS+YWG18NzGGwS+30HHDiju3mUv
// SIG // 7Jf2oVyW2ADWoUa9WfOXpQlLSBCZgB/QACnFsZulP0V3
// SIG // HjXG0qKin3p6IvpIlR+r+0cjgPWe+L9rt0uX4ut1eBrs
// SIG // 6jeZeRhL/9azI2h15q/6/IvrC4DqaTuv/DDtBEyO3991
// SIG // bWORPdGdVk5Pv4BXIqF4ETIheu9BCrE/+6jMpF3BoYib
// SIG // V3FWTkhFwELJm3ZbCoBIa/15n8G9bW1qyVJzEw16UM0x
// SIG // ghojMIIaHwIBATCBlTB+MQswCQYDVQQGEwJVUzETMBEG
// SIG // A1UECBMKV2FzaGluZ3RvbjEQMA4GA1UEBxMHUmVkbW9u
// SIG // ZDEeMBwGA1UEChMVTWljcm9zb2Z0IENvcnBvcmF0aW9u
// SIG // MSgwJgYDVQQDEx9NaWNyb3NvZnQgQ29kZSBTaWduaW5n
// SIG // IFBDQSAyMDExAhMzAAAEhJjiEuB4ozFdAAAAAASEMA0G
// SIG // CWCGSAFlAwQCAQUAoIGuMBkGCSqGSIb3DQEJAzEMBgor
// SIG // BgEEAYI3AgEEMBwGCisGAQQBgjcCAQsxDjAMBgorBgEE
// SIG // AYI3AgEVMC8GCSqGSIb3DQEJBDEiBCAZFWo2Js81cGsV
// SIG // n5fbK7skbGJI+Udvm5a6rNw+7I5qlzBCBgorBgEEAYI3
// SIG // AgEMMTQwMqAUgBIATQBpAGMAcgBvAHMAbwBmAHShGoAY
// SIG // aHR0cDovL3d3dy5taWNyb3NvZnQuY29tMA0GCSqGSIb3
// SIG // DQEBAQUABIIBAH8s/PoUBWv9JZxftp8dP32do738ZQSP
// SIG // Smf67Ww3oB4egPpUCXPwhw4nQlihsT8WV5FV8bazwIZl
// SIG // fvj1SUKhBGY8WsvgNWSZcJ2QKMIdkwW4+CFnR8KbQYu7
// SIG // 3eFpheM7T7Z7buC/Lre+Ow4KzlNx0vBrR/Wl3JcgeQ3h
// SIG // y4yvYmV1VZySqN6tXyreJAFmLRdrak6qlNd/9Ec5CFZq
// SIG // XFE1ZpLBo5vPZriB2mTNq0H9zM+HcR+PSCoBwYnt92bW
// SIG // mWuMUJ6kUkU8h18Q9EunF5mBOLb7QpK5q/HaKlqt1Ze9
// SIG // Njm1oFhbY5SJ6BGMBImfbhP6UWTJ2QHF7+otY6GjwTh/
// SIG // ekuhghetMIIXqQYKKwYBBAGCNwMDATGCF5kwgheVBgkq
// SIG // hkiG9w0BBwKggheGMIIXggIBAzEPMA0GCWCGSAFlAwQC
// SIG // AQUAMIIBWgYLKoZIhvcNAQkQAQSgggFJBIIBRTCCAUEC
// SIG // AQEGCisGAQQBhFkKAwEwMTANBglghkgBZQMEAgEFAAQg
// SIG // iURypXKZh7h4F7L/8Q1Mg8sHacscQZDgY7cjLUI8mcsC
// SIG // BmlC3MNethgTMjAyNjAxMTIxNzU2NTQuNzY4WjAEgAIB
// SIG // 9KCB2aSB1jCB0zELMAkGA1UEBhMCVVMxEzARBgNVBAgT
// SIG // Cldhc2hpbmd0b24xEDAOBgNVBAcTB1JlZG1vbmQxHjAc
// SIG // BgNVBAoTFU1pY3Jvc29mdCBDb3Jwb3JhdGlvbjEtMCsG
// SIG // A1UECxMkTWljcm9zb2Z0IElyZWxhbmQgT3BlcmF0aW9u
// SIG // cyBMaW1pdGVkMScwJQYDVQQLEx5uU2hpZWxkIFRTUyBF
// SIG // U046NjUxQS0wNUUwLUQ5NDcxJTAjBgNVBAMTHE1pY3Jv
// SIG // c29mdCBUaW1lLVN0YW1wIFNlcnZpY2WgghH7MIIHKDCC
// SIG // BRCgAwIBAgITMwAAAhUYA9OBByZ8UwABAAACFTANBgkq
// SIG // hkiG9w0BAQsFADB8MQswCQYDVQQGEwJVUzETMBEGA1UE
// SIG // CBMKV2FzaGluZ3RvbjEQMA4GA1UEBxMHUmVkbW9uZDEe
// SIG // MBwGA1UEChMVTWljcm9zb2Z0IENvcnBvcmF0aW9uMSYw
// SIG // JAYDVQQDEx1NaWNyb3NvZnQgVGltZS1TdGFtcCBQQ0Eg
// SIG // MjAxMDAeFw0yNTA4MTQxODQ4MjBaFw0yNjExMTMxODQ4
// SIG // MjBaMIHTMQswCQYDVQQGEwJVUzETMBEGA1UECBMKV2Fz
// SIG // aGluZ3RvbjEQMA4GA1UEBxMHUmVkbW9uZDEeMBwGA1UE
// SIG // ChMVTWljcm9zb2Z0IENvcnBvcmF0aW9uMS0wKwYDVQQL
// SIG // EyRNaWNyb3NvZnQgSXJlbGFuZCBPcGVyYXRpb25zIExp
// SIG // bWl0ZWQxJzAlBgNVBAsTHm5TaGllbGQgVFNTIEVTTjo2
// SIG // NTFBLTA1RTAtRDk0NzElMCMGA1UEAxMcTWljcm9zb2Z0
// SIG // IFRpbWUtU3RhbXAgU2VydmljZTCCAiIwDQYJKoZIhvcN
// SIG // AQEBBQADggIPADCCAgoCggIBAMNx1d4VcS9JRGD1dN13
// SIG // jSmede1SG4HsYZQz3aV8A0tAWLcT8IuF2KWUdZXdLunK
// SIG // 9l47roHYOdA1MeVhy9EIWNnfb5CUpNNqxP++YXCrfdZt
// SIG // iIdvO0EcUTJhbtwReuOupPKqebl7X3urnIquPWGkvKfn
// SIG // c797k2qw+IUPFE+y2veaTiYkascXdKjhixArxyxFz14q
// SIG // DUsfacoc4Zupbe3sy8SXhVWLcUoZGrz6GTdHTgomHoeC
// SIG // oKCqMmoMzLkoiwojFFuFHuELJuufBSTRkzYe1eal2FQO
// SIG // pOcY8OVnlnSjs9IvQOYwXG2PX1TqP3APItW8rc3A08W9
// SIG // 53LXJcvPzmHjbLZGm/yLKtwsXtb6venyBxNfmRpiY5Gt
// SIG // bKHcKj8nFaf9rW/gY7pTy+Q+q4FF0zxfOFPNkSyh1ee2
// SIG // wfHx0aYJ43FgULlz4FXkl6REVoprdDRdpQji86oK70v7
// SIG // 2KnXuS5/WJSioQGf8QxNEyyCK+viP9iU7Vz9+J340xDV
// SIG // ajASElnGpCMQMBm90QechwscpyBTVS3HygLBHQuVNnpt
// SIG // HwL5lb9LKJ6p79e3LmmItngi1oaCtSHPOQ8O7P5YXF6w
// SIG // aWOJ/0ZeZd8B87OLziIbvOwyMuUFGhLqRLMmNDVqoCOA
// SIG // Vper9cILHvpfA1hXlF6H4VLgoFU7kxzdyvInaDG5/EN3
// SIG // nVCBAgMBAAGjggFJMIIBRTAdBgNVHQ4EFgQUiSF38XKg
// SIG // MBaho/Y3cELXUqmnY9cwHwYDVR0jBBgwFoAUn6cVXQBe
// SIG // Yl2D9OXSZacbUzUZ6XIwXwYDVR0fBFgwVjBUoFKgUIZO
// SIG // aHR0cDovL3d3dy5taWNyb3NvZnQuY29tL3BraW9wcy9j
// SIG // cmwvTWljcm9zb2Z0JTIwVGltZS1TdGFtcCUyMFBDQSUy
// SIG // MDIwMTAoMSkuY3JsMGwGCCsGAQUFBwEBBGAwXjBcBggr
// SIG // BgEFBQcwAoZQaHR0cDovL3d3dy5taWNyb3NvZnQuY29t
// SIG // L3BraW9wcy9jZXJ0cy9NaWNyb3NvZnQlMjBUaW1lLVN0
// SIG // YW1wJTIwUENBJTIwMjAxMCgxKS5jcnQwDAYDVR0TAQH/
// SIG // BAIwADAWBgNVHSUBAf8EDDAKBggrBgEFBQcDCDAOBgNV
// SIG // HQ8BAf8EBAMCB4AwDQYJKoZIhvcNAQELBQADggIBAHeN
// SIG // h7VfpBm78cywUwuTu75AiAT8vwcKYws3i+d4QIhDnm6f
// SIG // lXTZ8JvRlQn2KtyjH64+FLykE1AGkuWZMHtYL2d5Y0kp
// SIG // wjskuTsDbvXaYN8MPkFtnjnEi5MlQFhay5+iIoN0wv81
// SIG // jL1Yal7XRYRtiidZUmzdttnLGNxN/waxpbgJbxE/YJsV
// SIG // cssTcuff+yRecyBnCYm8ncbPeCS9QbT4FyTn2c0Pv94k
// SIG // 3Ong7Zmlk+gynZyaHKfMJFyljyLARH5A+pNUIrcL7dJh
// SIG // 6zkWoe+Uo3nDireKFmslS5D04aNdntKJ4BINXI3uX8Um
// SIG // RrYazK1iryOEexxAu5PJmh/XjwN1Yh9AlUkjnn2j0xjM
// SIG // yIRwqOad4xuUjHMjt3gPbhGmECSEyZSxtwcMBpsqWOwv
// SIG // /P549UjoYMdR4CdMsDiS/cXz+ADnFpgn27KoBmwmgu1h
// SIG // +bCDXc3zGq/Fe2DRapGwhlCoXPBqSMhPjCp8lZ9947Lm
// SIG // hgJTUYO3VUVEqGCycb1LMPRjsMgaQcGxPbKji5vh7DtN
// SIG // KBdtzzIqO1hV3BU2QI6d7o4oQQHy61yAoBjhz3ZGdONr
// SIG // tS2ajnJ5a91874DHvpjz8mrFvH9K7cyY91eRPxCoskJT
// SIG // 8Y/TH6tsfYYpp5V1hmQlT3hAUTqzWw2AX2s08izQjk7E
// SIG // bZLDkldxQbT56ULSze+eMIIHcTCCBVmgAwIBAgITMwAA
// SIG // ABXF52ueAptJmQAAAAAAFTANBgkqhkiG9w0BAQsFADCB
// SIG // iDELMAkGA1UEBhMCVVMxEzARBgNVBAgTCldhc2hpbmd0
// SIG // b24xEDAOBgNVBAcTB1JlZG1vbmQxHjAcBgNVBAoTFU1p
// SIG // Y3Jvc29mdCBDb3Jwb3JhdGlvbjEyMDAGA1UEAxMpTWlj
// SIG // cm9zb2Z0IFJvb3QgQ2VydGlmaWNhdGUgQXV0aG9yaXR5
// SIG // IDIwMTAwHhcNMjEwOTMwMTgyMjI1WhcNMzAwOTMwMTgz
// SIG // MjI1WjB8MQswCQYDVQQGEwJVUzETMBEGA1UECBMKV2Fz
// SIG // aGluZ3RvbjEQMA4GA1UEBxMHUmVkbW9uZDEeMBwGA1UE
// SIG // ChMVTWljcm9zb2Z0IENvcnBvcmF0aW9uMSYwJAYDVQQD
// SIG // Ex1NaWNyb3NvZnQgVGltZS1TdGFtcCBQQ0EgMjAxMDCC
// SIG // AiIwDQYJKoZIhvcNAQEBBQADggIPADCCAgoCggIBAOTh
// SIG // pkzntHIhC3miy9ckeb0O1YLT/e6cBwfSqWxOdcjKNVf2
// SIG // AX9sSuDivbk+F2Az/1xPx2b3lVNxWuJ+Slr+uDZnhUYj
// SIG // DLWNE893MsAQGOhgfWpSg0S3po5GawcU88V29YZQ3MFE
// SIG // yHFcUTE3oAo4bo3t1w/YJlN8OWECesSq/XJprx2rrPY2
// SIG // vjUmZNqYO7oaezOtgFt+jBAcnVL+tuhiJdxqD89d9P6O
// SIG // U8/W7IVWTe/dvI2k45GPsjksUZzpcGkNyjYtcI4xyDUo
// SIG // veO0hyTD4MmPfrVUj9z6BVWYbWg7mka97aSueik3rMvr
// SIG // g0XnRm7KMtXAhjBcTyziYrLNueKNiOSWrAFKu75xqRdb
// SIG // Z2De+JKRHh09/SDPc31BmkZ1zcRfNN0Sidb9pSB9fvzZ
// SIG // nkXftnIv231fgLrbqn427DZM9ituqBJR6L8FA6PRc6ZN
// SIG // N3SUHDSCD/AQ8rdHGO2n6Jl8P0zbr17C89XYcz1DTsEz
// SIG // OUyOArxCaC4Q6oRRRuLRvWoYWmEBc8pnol7XKHYC4jMY
// SIG // ctenIPDC+hIK12NvDMk2ZItboKaDIV1fMHSRlJTYuVD5
// SIG // C4lh8zYGNRiER9vcG9H9stQcxWv2XFJRXRLbJbqvUAV6
// SIG // bMURHXLvjflSxIUXk8A8FdsaN8cIFRg/eKtFtvUeh17a
// SIG // j54WcmnGrnu3tz5q4i6tAgMBAAGjggHdMIIB2TASBgkr
// SIG // BgEEAYI3FQEEBQIDAQABMCMGCSsGAQQBgjcVAgQWBBQq
// SIG // p1L+ZMSavoKRPEY1Kc8Q/y8E7jAdBgNVHQ4EFgQUn6cV
// SIG // XQBeYl2D9OXSZacbUzUZ6XIwXAYDVR0gBFUwUzBRBgwr
// SIG // BgEEAYI3TIN9AQEwQTA/BggrBgEFBQcCARYzaHR0cDov
// SIG // L3d3dy5taWNyb3NvZnQuY29tL3BraW9wcy9Eb2NzL1Jl
// SIG // cG9zaXRvcnkuaHRtMBMGA1UdJQQMMAoGCCsGAQUFBwMI
// SIG // MBkGCSsGAQQBgjcUAgQMHgoAUwB1AGIAQwBBMAsGA1Ud
// SIG // DwQEAwIBhjAPBgNVHRMBAf8EBTADAQH/MB8GA1UdIwQY
// SIG // MBaAFNX2VsuP6KJcYmjRPZSQW9fOmhjEMFYGA1UdHwRP
// SIG // ME0wS6BJoEeGRWh0dHA6Ly9jcmwubWljcm9zb2Z0LmNv
// SIG // bS9wa2kvY3JsL3Byb2R1Y3RzL01pY1Jvb0NlckF1dF8y
// SIG // MDEwLTA2LTIzLmNybDBaBggrBgEFBQcBAQROMEwwSgYI
// SIG // KwYBBQUHMAKGPmh0dHA6Ly93d3cubWljcm9zb2Z0LmNv
// SIG // bS9wa2kvY2VydHMvTWljUm9vQ2VyQXV0XzIwMTAtMDYt
// SIG // MjMuY3J0MA0GCSqGSIb3DQEBCwUAA4ICAQCdVX38Kq3h
// SIG // LB9nATEkW+Geckv8qW/qXBS2Pk5HZHixBpOXPTEztTnX
// SIG // wnE2P9pkbHzQdTltuw8x5MKP+2zRoZQYIu7pZmc6U03d
// SIG // mLq2HnjYNi6cqYJWAAOwBb6J6Gngugnue99qb74py27Y
// SIG // P0h1AdkY3m2CDPVtI1TkeFN1JFe53Z/zjj3G82jfZfak
// SIG // Vqr3lbYoVSfQJL1AoL8ZthISEV09J+BAljis9/kpicO8
// SIG // F7BUhUKz/AyeixmJ5/ALaoHCgRlCGVJ1ijbCHcNhcy4s
// SIG // a3tuPywJeBTpkbKpW99Jo3QMvOyRgNI95ko+ZjtPu4b6
// SIG // MhrZlvSP9pEB9s7GdP32THJvEKt1MMU0sHrYUP4KWN1A
// SIG // PMdUbZ1jdEgssU5HLcEUBHG/ZPkkvnNtyo4JvbMBV0lU
// SIG // ZNlz138eW0QBjloZkWsNn6Qo3GcZKCS6OEuabvshVGtq
// SIG // RRFHqfG3rsjoiV5PndLQTHa1V1QJsWkBRH58oWFsc/4K
// SIG // u+xBZj1p/cvBQUl+fpO+y/g75LcVv7TOPqUxUYS8vwLB
// SIG // gqJ7Fx0ViY1w/ue10CgaiQuPNtq6TPmb/wrpNPgkNWcr
// SIG // 4A245oyZ1uEi6vAnQj0llOZ0dFtq0Z4+7X6gMTN9vMvp
// SIG // e784cETRkPHIqzqKOghif9lwY1NNje6CbaUFEMFxBmoQ
// SIG // tB1VM1izoXBm8qGCA1YwggI+AgEBMIIBAaGB2aSB1jCB
// SIG // 0zELMAkGA1UEBhMCVVMxEzARBgNVBAgTCldhc2hpbmd0
// SIG // b24xEDAOBgNVBAcTB1JlZG1vbmQxHjAcBgNVBAoTFU1p
// SIG // Y3Jvc29mdCBDb3Jwb3JhdGlvbjEtMCsGA1UECxMkTWlj
// SIG // cm9zb2Z0IElyZWxhbmQgT3BlcmF0aW9ucyBMaW1pdGVk
// SIG // MScwJQYDVQQLEx5uU2hpZWxkIFRTUyBFU046NjUxQS0w
// SIG // NUUwLUQ5NDcxJTAjBgNVBAMTHE1pY3Jvc29mdCBUaW1l
// SIG // LVN0YW1wIFNlcnZpY2WiIwoBATAHBgUrDgMCGgMVAI+n
// SIG // k3o27mBNSH42367erV3rwlEgoIGDMIGApH4wfDELMAkG
// SIG // A1UEBhMCVVMxEzARBgNVBAgTCldhc2hpbmd0b24xEDAO
// SIG // BgNVBAcTB1JlZG1vbmQxHjAcBgNVBAoTFU1pY3Jvc29m
// SIG // dCBDb3Jwb3JhdGlvbjEmMCQGA1UEAxMdTWljcm9zb2Z0
// SIG // IFRpbWUtU3RhbXAgUENBIDIwMTAwDQYJKoZIhvcNAQEL
// SIG // BQACBQDtD6D4MCIYDzIwMjYwMTEyMTYzNDAwWhgPMjAy
// SIG // NjAxMTMxNjM0MDBaMHQwOgYKKwYBBAGEWQoEATEsMCow
// SIG // CgIFAO0PoPgCAQAwBwIBAAICIz8wBwIBAAICEnEwCgIF
// SIG // AO0Q8ngCAQAwNgYKKwYBBAGEWQoEAjEoMCYwDAYKKwYB
// SIG // BAGEWQoDAqAKMAgCAQACAwehIKEKMAgCAQACAwGGoDAN
// SIG // BgkqhkiG9w0BAQsFAAOCAQEArw333DXfvbEq91mfy/i1
// SIG // qRmRay87E8dP9TRZaz+Wq9qqrNlKtKSvs8F1sPZGQPB8
// SIG // siOADQaVzeehvJ9hLiM5tZ79QwPhLv/0pqF5sFp21Ken
// SIG // DN2lA1PP88AZIINo6x4zYoCys+Sh/ePlE1zLUmxvMfZT
// SIG // 0l/ImXsSSwyBtRhNsXZ1uxo9aqot1OdlqXh9L/0YNBB5
// SIG // 1uoSgRG90hN6gTQ7cvjJbVC4psOxAR1e9QIncKy3juec
// SIG // qxK3bofoiZvPNriN1d7ymUTLuwlCfx6Lg9NxLjo+L/tC
// SIG // BSK7ff7KDW6MXj9WmD5vVTyDLPXSQRExlgZWGr1lWRAg
// SIG // +o6Y/PXbPhgFMjGCBA0wggQJAgEBMIGTMHwxCzAJBgNV
// SIG // BAYTAlVTMRMwEQYDVQQIEwpXYXNoaW5ndG9uMRAwDgYD
// SIG // VQQHEwdSZWRtb25kMR4wHAYDVQQKExVNaWNyb3NvZnQg
// SIG // Q29ycG9yYXRpb24xJjAkBgNVBAMTHU1pY3Jvc29mdCBU
// SIG // aW1lLVN0YW1wIFBDQSAyMDEwAhMzAAACFRgD04EHJnxT
// SIG // AAEAAAIVMA0GCWCGSAFlAwQCAQUAoIIBSjAaBgkqhkiG
// SIG // 9w0BCQMxDQYLKoZIhvcNAQkQAQQwLwYJKoZIhvcNAQkE
// SIG // MSIEIICHQY4s7tzzyczyLCXvCMHElzjGjlAcTleBiacO
// SIG // syHvMIH6BgsqhkiG9w0BCRACLzGB6jCB5zCB5DCBvQQg
// SIG // cBD0djw60xS3K7ULCq1Iu6M+STUQhfykRzIoUjXu7Iow
// SIG // gZgwgYCkfjB8MQswCQYDVQQGEwJVUzETMBEGA1UECBMK
// SIG // V2FzaGluZ3RvbjEQMA4GA1UEBxMHUmVkbW9uZDEeMBwG
// SIG // A1UEChMVTWljcm9zb2Z0IENvcnBvcmF0aW9uMSYwJAYD
// SIG // VQQDEx1NaWNyb3NvZnQgVGltZS1TdGFtcCBQQ0EgMjAx
// SIG // MAITMwAAAhUYA9OBByZ8UwABAAACFTAiBCAIoUFDgNGA
// SIG // pRq5t4iP+N0XTtzrh4C3fnsPr+cj8abAyDANBgkqhkiG
// SIG // 9w0BAQsFAASCAgBLG/Ns/xuvCTT3m3eg2cH7Ip6gZXDD
// SIG // lRJu5sTwrM0h2AuSWPwmYnUFUqKC1+926Uc7q8LgKPMv
// SIG // INIs2riMQ63Lg4EmyH9qWc8VyoSLCln/nAbcJOs+3mZ+
// SIG // xQYaThP7Sb9YshUClGRGt7XdSCqXMXmj/bvuNMLOQsxT
// SIG // NHY4TWRzlL11VnzcXibY1YjevhGTGbo5MXE+akZCWFDN
// SIG // EBcq6NRxlewdKoDEbCsQLwOi6CzQPd7s9X0qqRHlR/vE
// SIG // 6IWqU/fxB7dx0wp/ZVK9YVeiLHv0XS9cIuCpHUgQChp9
// SIG // h02qZBRwvEKc5LRWYye3AonbHV+307UevLMY82cHkwnk
// SIG // kpg25RCg+WGPMP4OLolx0fNL/yZ7N7pzZ9akubgcFivf
// SIG // hjkTY+d5fRIf+1T//gWhpZvSXs/8oe7vKoO1glBksVI0
// SIG // /9ffXkLvEbNhcWgkVj+LOM1gEJeeJE3AHtQkKC/rWNHp
// SIG // Z3kRFROg3FoFWFL0or9MSdjPFiOc1sJWD0CF86jMO+N4
// SIG // bwy6hZuF+P+5HPg2Q2DdDsxis+5FTAyaljxxGCQ6iepx
// SIG // plJDRz8zhF4bUQpDgMcwj3YYKiMC6TGMUhQkd/PDQlBx
// SIG // u9cr7OH3+Agw22jhT63NcJgCLrb5gkq5S5wZfD9jf4BZ
// SIG // 67UhVVFH0ZqzD5zWyKipBuZFd1Idr0U49JEekA==
// SIG // End signature block
