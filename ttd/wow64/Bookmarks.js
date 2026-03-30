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
// SIG // MIIoKAYJKoZIhvcNAQcCoIIoGTCCKBUCAQExDzANBglg
// SIG // hkgBZQMEAgEFADB3BgorBgEEAYI3AgEEoGkwZzAyBgor
// SIG // BgEEAYI3AgEeMCQCAQEEEBDgyQbOONQRoqMAEEvTUJAC
// SIG // AQACAQACAQACAQACAQAwMTANBglghkgBZQMEAgEFAAQg
// SIG // 7aX/GnuE6sGgPGKORLPLKTHYvWdrVZaKCX07IVOuL/ig
// SIG // gg12MIIF9DCCA9ygAwIBAgITMwAABIVemewOWS/N1wAA
// SIG // AAAEhTANBgkqhkiG9w0BAQsFADB+MQswCQYDVQQGEwJV
// SIG // UzETMBEGA1UECBMKV2FzaGluZ3RvbjEQMA4GA1UEBxMH
// SIG // UmVkbW9uZDEeMBwGA1UEChMVTWljcm9zb2Z0IENvcnBv
// SIG // cmF0aW9uMSgwJgYDVQQDEx9NaWNyb3NvZnQgQ29kZSBT
// SIG // aWduaW5nIFBDQSAyMDExMB4XDTI1MDYxOTE4MjEzN1oX
// SIG // DTI2MDYxNzE4MjEzN1owdDELMAkGA1UEBhMCVVMxEzAR
// SIG // BgNVBAgTCldhc2hpbmd0b24xEDAOBgNVBAcTB1JlZG1v
// SIG // bmQxHjAcBgNVBAoTFU1pY3Jvc29mdCBDb3Jwb3JhdGlv
// SIG // bjEeMBwGA1UEAxMVTWljcm9zb2Z0IENvcnBvcmF0aW9u
// SIG // MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA
// SIG // wEpIdXKb7lKn26sXpXuywkhxGplTQXxROLmNRZBrAHVB
// SIG // f7546RNXZwA/bzDqsuWTuPSC4T+I4j/z9j5/WqPuUw7S
// SIG // pnEPqWXc2xu7eN8kVyQt5170xkK6KHT4vVEkIvayPtIM
// SIG // Ll0SgSCOy/pN5DJCi5ha7FlI84F1Qi2GumR+wQgCwHCV
// SIG // mU8Fj6Ik+B6akISXGCwe6X3rQFQngRFWQ/IrSkOkAOfy
// SIG // 0EfvV+nZUo+FcbWuCZ6cb4Eq5I1ws/rZSeuwAWeedZcN
// SIG // t0VlNbsn4AnxBYQX4sj0dlko7JD5fWqeqq3/HzUNbBmL
// SIG // p9qeCXV8XlACn9YVWv900F47z04kVwpyTwIDAQABo4IB
// SIG // czCCAW8wHwYDVR0lBBgwFgYKKwYBBAGCN0wIAQYIKwYB
// SIG // BQUHAwMwHQYDVR0OBBYEFLgmchogri2BNGlO4+UxamNO
// SIG // ZJKNMEUGA1UdEQQ+MDykOjA4MR4wHAYDVQQLExVNaWNy
// SIG // b3NvZnQgQ29ycG9yYXRpb24xFjAUBgNVBAUTDTIzMDAx
// SIG // Mis1MDUzNTkwHwYDVR0jBBgwFoAUSG5k5VAF04KqFzc3
// SIG // IrVtqMp1ApUwVAYDVR0fBE0wSzBJoEegRYZDaHR0cDov
// SIG // L3d3dy5taWNyb3NvZnQuY29tL3BraW9wcy9jcmwvTWlj
// SIG // Q29kU2lnUENBMjAxMV8yMDExLTA3LTA4LmNybDBhBggr
// SIG // BgEFBQcBAQRVMFMwUQYIKwYBBQUHMAKGRWh0dHA6Ly93
// SIG // d3cubWljcm9zb2Z0LmNvbS9wa2lvcHMvY2VydHMvTWlj
// SIG // Q29kU2lnUENBMjAxMV8yMDExLTA3LTA4LmNydDAMBgNV
// SIG // HRMBAf8EAjAAMA0GCSqGSIb3DQEBCwUAA4ICAQAo5qgK
// SIG // dgouLEx2XIvqpLRACrBZORzVRislkdqxRl7He3IIGdOB
// SIG // +VOEldHwC+nzhPXS77eCOxwRy4aRnROVIy8uDcS0xtmw
// SIG // wJHgFZsZndrillRisptWmqw8V379xgjeJkV/j5+HPqct
// SIG // 0v+ipLeXkgwCCLK8ysNyodkltYQsF1/5Nb+G/jR9RY5f
// SIG // ov8TybKVwhbmQeGguRS0+X4G0Sqp7FngHZ/A7K2EIU90
// SIG // Fy7ejb9/3TM7+xvwnaW3XKLpfBWJfrd3ZlzPkiApQt5d
// SIG // mntMDpTa0ONskBMnLj1OTqKi0/OY7Ge/uAmknHxSDZTu
// SIG // 5e2O6/8Wrqh20j0Na96CAvnu9ebNhtwpWWt8vfWmMdpZ
// SIG // 12HtbK3KyMfDQF01YosqV1Z/WRphJHzXHw4qhkMJJpec
// SIG // /Z5t6VogWevWnWgQWwBRI8iRuMtGu+m3pf+LAwlb2mcy
// SIG // zN0xW8VTvQUK42UbWyWW5At1wK6S6mUn8ed0rmHXXcT1
// SIG // /Kb3KhbhLvMHFHg9ObfcTWyeE7XQBAiZRItL7wcZZjOb
// SIG // cxV8tqmXqjzFx0kGKj4GfY70nGejcM5xQ9Pt95G88oTk
// SIG // s/1rhmwLuHB2RvICp5UFU+LgNg4nsfQzLNlh4qJDZJ2J
// SIG // S6FHll1tUKyS6ajvNky8ik2wTP6GRwHSHNJM6Ek66PW9
// SIG // /r459vNPQ9PkjjglWTCCB3owggVioAMCAQICCmEOkNIA
// SIG // AAAAAAMwDQYJKoZIhvcNAQELBQAwgYgxCzAJBgNVBAYT
// SIG // AlVTMRMwEQYDVQQIEwpXYXNoaW5ndG9uMRAwDgYDVQQH
// SIG // EwdSZWRtb25kMR4wHAYDVQQKExVNaWNyb3NvZnQgQ29y
// SIG // cG9yYXRpb24xMjAwBgNVBAMTKU1pY3Jvc29mdCBSb290
// SIG // IENlcnRpZmljYXRlIEF1dGhvcml0eSAyMDExMB4XDTEx
// SIG // MDcwODIwNTkwOVoXDTI2MDcwODIxMDkwOVowfjELMAkG
// SIG // A1UEBhMCVVMxEzARBgNVBAgTCldhc2hpbmd0b24xEDAO
// SIG // BgNVBAcTB1JlZG1vbmQxHjAcBgNVBAoTFU1pY3Jvc29m
// SIG // dCBDb3Jwb3JhdGlvbjEoMCYGA1UEAxMfTWljcm9zb2Z0
// SIG // IENvZGUgU2lnbmluZyBQQ0EgMjAxMTCCAiIwDQYJKoZI
// SIG // hvcNAQEBBQADggIPADCCAgoCggIBAKvw+nIQHC6t2G6q
// SIG // ghBNNLrytlghn0IbKmvpWlCquAY4GgRJun/DDB7dN2vG
// SIG // EtgL8DjCmQawyDnVARQxQtOJDXlkh36UYCRsr55JnOlo
// SIG // XtLfm1OyCizDr9mpK656Ca/XllnKYBoF6WZ26DJSJhIv
// SIG // 56sIUM+zRLdd2MQuA3WraPPLbfM6XKEW9Ea64DhkrG5k
// SIG // NXimoGMPLdNAk/jj3gcN1Vx5pUkp5w2+oBN3vpQ97/vj
// SIG // K1oQH01WKKJ6cuASOrdJXtjt7UORg9l7snuGG9k+sYxd
// SIG // 6IlPhBryoS9Z5JA7La4zWMW3Pv4y07MDPbGyr5I4ftKd
// SIG // gCz1TlaRITUlwzluZH9TupwPrRkjhMv0ugOGjfdf8NBS
// SIG // v4yUh7zAIXQlXxgotswnKDglmDlKNs98sZKuHCOnqWbs
// SIG // YR9q4ShJnV+I4iVd0yFLPlLEtVc/JAPw0XpbL9Uj43Bd
// SIG // D1FGd7P4AOG8rAKCX9vAFbO9G9RVS+c5oQ/pI0m8GLhE
// SIG // fEXkwcNyeuBy5yTfv0aZxe/CHFfbg43sTUkwp6uO3+xb
// SIG // n6/83bBm4sGXgXvt1u1L50kppxMopqd9Z4DmimJ4X7Iv
// SIG // hNdXnFy/dygo8e1twyiPLI9AN0/B4YVEicQJTMXUpUMv
// SIG // dJX3bvh4IFgsE11glZo+TzOE2rCIF96eTvSWsLxGoGyY
// SIG // 0uDWiIwLAgMBAAGjggHtMIIB6TAQBgkrBgEEAYI3FQEE
// SIG // AwIBADAdBgNVHQ4EFgQUSG5k5VAF04KqFzc3IrVtqMp1
// SIG // ApUwGQYJKwYBBAGCNxQCBAweCgBTAHUAYgBDAEEwCwYD
// SIG // VR0PBAQDAgGGMA8GA1UdEwEB/wQFMAMBAf8wHwYDVR0j
// SIG // BBgwFoAUci06AjGQQ7kUBU7h6qfHMdEjiTQwWgYDVR0f
// SIG // BFMwUTBPoE2gS4ZJaHR0cDovL2NybC5taWNyb3NvZnQu
// SIG // Y29tL3BraS9jcmwvcHJvZHVjdHMvTWljUm9vQ2VyQXV0
// SIG // MjAxMV8yMDExXzAzXzIyLmNybDBeBggrBgEFBQcBAQRS
// SIG // MFAwTgYIKwYBBQUHMAKGQmh0dHA6Ly93d3cubWljcm9z
// SIG // b2Z0LmNvbS9wa2kvY2VydHMvTWljUm9vQ2VyQXV0MjAx
// SIG // MV8yMDExXzAzXzIyLmNydDCBnwYDVR0gBIGXMIGUMIGR
// SIG // BgkrBgEEAYI3LgMwgYMwPwYIKwYBBQUHAgEWM2h0dHA6
// SIG // Ly93d3cubWljcm9zb2Z0LmNvbS9wa2lvcHMvZG9jcy9w
// SIG // cmltYXJ5Y3BzLmh0bTBABggrBgEFBQcCAjA0HjIgHQBM
// SIG // AGUAZwBhAGwAXwBwAG8AbABpAGMAeQBfAHMAdABhAHQA
// SIG // ZQBtAGUAbgB0AC4gHTANBgkqhkiG9w0BAQsFAAOCAgEA
// SIG // Z/KGpZjgVHkaLtPYdGcimwuWEeFjkplCln3SeQyQwWVf
// SIG // Liw++MNy0W2D/r4/6ArKO79HqaPzadtjvyI1pZddZYSQ
// SIG // fYtGUFXYDJJ80hpLHPM8QotS0LD9a+M+By4pm+Y9G6XU
// SIG // tR13lDni6WTJRD14eiPzE32mkHSDjfTLJgJGKsKKELuk
// SIG // qQUMm+1o+mgulaAqPyprWEljHwlpblqYluSD9MCP80Yr
// SIG // 3vw70L01724lruWvJ+3Q3fMOr5kol5hNDj0L8giJ1h/D
// SIG // Mhji8MUtzluetEk5CsYKwsatruWy2dsViFFFWDgycSca
// SIG // f7H0J/jeLDogaZiyWYlobm+nt3TDQAUGpgEqKD6CPxNN
// SIG // ZgvAs0314Y9/HG8VfUWnduVAKmWjw11SYobDHWM2l4bf
// SIG // 2vP48hahmifhzaWX0O5dY0HjWwechz4GdwbRBrF1HxS+
// SIG // YWG18NzGGwS+30HHDiju3mUv7Jf2oVyW2ADWoUa9WfOX
// SIG // pQlLSBCZgB/QACnFsZulP0V3HjXG0qKin3p6IvpIlR+r
// SIG // +0cjgPWe+L9rt0uX4ut1eBrs6jeZeRhL/9azI2h15q/6
// SIG // /IvrC4DqaTuv/DDtBEyO3991bWORPdGdVk5Pv4BXIqF4
// SIG // ETIheu9BCrE/+6jMpF3BoYibV3FWTkhFwELJm3ZbCoBI
// SIG // a/15n8G9bW1qyVJzEw16UM0xghoKMIIaBgIBATCBlTB+
// SIG // MQswCQYDVQQGEwJVUzETMBEGA1UECBMKV2FzaGluZ3Rv
// SIG // bjEQMA4GA1UEBxMHUmVkbW9uZDEeMBwGA1UEChMVTWlj
// SIG // cm9zb2Z0IENvcnBvcmF0aW9uMSgwJgYDVQQDEx9NaWNy
// SIG // b3NvZnQgQ29kZSBTaWduaW5nIFBDQSAyMDExAhMzAAAE
// SIG // hV6Z7A5ZL83XAAAAAASFMA0GCWCGSAFlAwQCAQUAoIGu
// SIG // MBkGCSqGSIb3DQEJAzEMBgorBgEEAYI3AgEEMBwGCisG
// SIG // AQQBgjcCAQsxDjAMBgorBgEEAYI3AgEVMC8GCSqGSIb3
// SIG // DQEJBDEiBCAZFWo2Js81cGsVn5fbK7skbGJI+Udvm5a6
// SIG // rNw+7I5qlzBCBgorBgEEAYI3AgEMMTQwMqAUgBIATQBp
// SIG // AGMAcgBvAHMAbwBmAHShGoAYaHR0cDovL3d3dy5taWNy
// SIG // b3NvZnQuY29tMA0GCSqGSIb3DQEBAQUABIIBAHcUTPvl
// SIG // 72h2eS1g6IJs7AWkKdY+fTka6jAK0iEiTUYW0HK0kv8d
// SIG // BwZ99b1yMo9Mawac7YBkDanX0rprbpTUF+Opz+p5yrs7
// SIG // HBfZGsRo83+Vkwm1fQLh6PVk2aD9g4R24EL/9ZVucQdE
// SIG // nMXhuvUDXvhwSEC225q0HIeSsj8WKkuq8z4+gm2EavPt
// SIG // YOe8a+vDl00ba5QSqDQtK1YFqWiArgnHBs2hOLPBPt9V
// SIG // LArWJvgGzGEdFpuEhFMP+FT7NtzdPEahz0r3pS1gutoX
// SIG // jMPuKuub1vokg1kfs2b9tE1hvJoi2eJeqVqfsZCp7qFV
// SIG // 03Uqauh03gS/GXIBf5r3kFMAtmChgheUMIIXkAYKKwYB
// SIG // BAGCNwMDATGCF4Awghd8BgkqhkiG9w0BBwKgghdtMIIX
// SIG // aQIBAzEPMA0GCWCGSAFlAwQCAQUAMIIBUgYLKoZIhvcN
// SIG // AQkQAQSgggFBBIIBPTCCATkCAQEGCisGAQQBhFkKAwEw
// SIG // MTANBglghkgBZQMEAgEFAAQgaFaZtx2Fta0QQO3mtydG
// SIG // gHgLbxPE9TVjfOvjHxcgR+wCBmk6/PYLrhgTMjAyNjAx
// SIG // MTIxNzUyMDIuNjA0WjAEgAIB9KCB0aSBzjCByzELMAkG
// SIG // A1UEBhMCVVMxEzARBgNVBAgTCldhc2hpbmd0b24xEDAO
// SIG // BgNVBAcTB1JlZG1vbmQxHjAcBgNVBAoTFU1pY3Jvc29m
// SIG // dCBDb3Jwb3JhdGlvbjElMCMGA1UECxMcTWljcm9zb2Z0
// SIG // IEFtZXJpY2EgT3BlcmF0aW9uczEnMCUGA1UECxMeblNo
// SIG // aWVsZCBUU1MgRVNOOjg2MDMtMDVFMC1EOTQ3MSUwIwYD
// SIG // VQQDExxNaWNyb3NvZnQgVGltZS1TdGFtcCBTZXJ2aWNl
// SIG // oIIR6jCCByAwggUIoAMCAQICEzMAAAIHLBE5ic2F+8UA
// SIG // AQAAAgcwDQYJKoZIhvcNAQELBQAwfDELMAkGA1UEBhMC
// SIG // VVMxEzARBgNVBAgTCldhc2hpbmd0b24xEDAOBgNVBAcT
// SIG // B1JlZG1vbmQxHjAcBgNVBAoTFU1pY3Jvc29mdCBDb3Jw
// SIG // b3JhdGlvbjEmMCQGA1UEAxMdTWljcm9zb2Z0IFRpbWUt
// SIG // U3RhbXAgUENBIDIwMTAwHhcNMjUwMTMwMTk0MjUyWhcN
// SIG // MjYwNDIyMTk0MjUyWjCByzELMAkGA1UEBhMCVVMxEzAR
// SIG // BgNVBAgTCldhc2hpbmd0b24xEDAOBgNVBAcTB1JlZG1v
// SIG // bmQxHjAcBgNVBAoTFU1pY3Jvc29mdCBDb3Jwb3JhdGlv
// SIG // bjElMCMGA1UECxMcTWljcm9zb2Z0IEFtZXJpY2EgT3Bl
// SIG // cmF0aW9uczEnMCUGA1UECxMeblNoaWVsZCBUU1MgRVNO
// SIG // Ojg2MDMtMDVFMC1EOTQ3MSUwIwYDVQQDExxNaWNyb3Nv
// SIG // ZnQgVGltZS1TdGFtcCBTZXJ2aWNlMIICIjANBgkqhkiG
// SIG // 9w0BAQEFAAOCAg8AMIICCgKCAgEAxT//enT5nH4Dg3t/
// SIG // 57hb3rgbLfyZksUpDp/PWRcrR0Jt+OIi6D6pFcLPgolH
// SIG // o0Gmyn/v3OylNZ6sAJprYj5xvM5uEpffkSWWkOA8d6rQ
// SIG // PZnUHUuwoX+mFGz+GfvvJWjW00IoCaFwps5Vd+L5guM6
// SIG // RaxE+CgAE410jytLELhYSq+5bTWjBRnJV0pyIXJ0nI/U
// SIG // FA1S0KQLCbbCh8hze3De+GhFy6RRnNSPlmBUcWk4Kkj6
// SIG // hkXxH7kNshqwG1oyWDl7nnkwNTFSoVvM80hKX4yniv7d
// SIG // l7ispKQlGip+bPLKjWyN2x7f6xP6Tc8FpwCs/jzgUWyc
// SIG // SJJi/p/xDFYq+bvLslj5dbfPDCuedQBlYfth+M4kdeGA
// SIG // 8c8ghvduIGqJyo4nGJ1lATrV65zyugEvyzemPvCsYdum
// SIG // urymxW82qllwI8xIkPBGPSvaWCPygsoIsYw8B31IFUlg
// SIG // sk/CsO5hgclGZkTz8VzjZbjHvz/ArQSTKbofAgVso7xX
// SIG // xZjkjUSvBE5FJpU1AEdQiDmngaixsLHEoRX8rw0K2woZ
// SIG // oV4m+J0TF+VPWK/Xe1XGB5+nmSbIMs4eUCpSGwkAv2L4
// SIG // RSuNnHggQzG3PjreUek/zMHHuY1clQpql1cVjmkHOKwN
// SIG // p1e6JzDmQulLwhvCxhUmQZ49ZaAwy1qPyPkbkaJNo/0O
// SIG // M3DJ8JECAwEAAaOCAUkwggFFMB0GA1UdDgQWBBRytVJi
// SIG // wr160Ar0ffCQatfP+M6NHjAfBgNVHSMEGDAWgBSfpxVd
// SIG // AF5iXYP05dJlpxtTNRnpcjBfBgNVHR8EWDBWMFSgUqBQ
// SIG // hk5odHRwOi8vd3d3Lm1pY3Jvc29mdC5jb20vcGtpb3Bz
// SIG // L2NybC9NaWNyb3NvZnQlMjBUaW1lLVN0YW1wJTIwUENB
// SIG // JTIwMjAxMCgxKS5jcmwwbAYIKwYBBQUHAQEEYDBeMFwG
// SIG // CCsGAQUFBzAChlBodHRwOi8vd3d3Lm1pY3Jvc29mdC5j
// SIG // b20vcGtpb3BzL2NlcnRzL01pY3Jvc29mdCUyMFRpbWUt
// SIG // U3RhbXAlMjBQQ0ElMjAyMDEwKDEpLmNydDAMBgNVHRMB
// SIG // Af8EAjAAMBYGA1UdJQEB/wQMMAoGCCsGAQUFBwMIMA4G
// SIG // A1UdDwEB/wQEAwIHgDANBgkqhkiG9w0BAQsFAAOCAgEA
// SIG // 47tKrj254sdLJRIw+49ttuKWDjxk5nQ7ztPmzUQjZGal
// SIG // L9Oz9OJ39SH92P4iRJlGlO8NdhZufNiJqQ/ysNgpV6zS
// SIG // iz0wTup38bzjxrWpaQJeMKqBoGcb6cW9shLpxuMmUOhE
// SIG // DqYNXRPbjl6M3t4A+B47XHO+ZHGvMor6MBCPq4V7lVFg
// SIG // e76IOExlMSnZw76ZORkhl5zoTw4XSHfoOoUcl3WYsIBG
// SIG // vqvTPV3Lc+ExoQ4DihbGMRYVzSWaPSkbhqunr4bcjXbm
// SIG // K5M4w7VkuoFvGpEefVIbixrFavuAIKhGPFpV40BjNjk5
// SIG // MgZ5UC6QfKg+8fY0aWNgqtDllpStMHx/9c3n61jefm3v
// SIG // O0sNkz3CLnSCZ9/W2wxu2sCjFWAx37DyfGb8YFpGbn+m
// SIG // WQJKYdHmBodyFfOObWi5HSzgr8OPVsaoWuQ5otjo4fBo
// SIG // 2ub/ZMmNykxcl90+AtrHMX4Kf+sUXfgxjoTVT71T2v98
// SIG // kVKmObOVGKcvA526aVe50DtrHtx7wkm62/sj8nqG9ZFH
// SIG // zGGvXxNmxLKDGzmh0YBo4vGT7fyXdmz33UKAR3FDqj8I
// SIG // xwVCHEnO8XSWWI0W+JvNasY5mtwy47jhZYzGU2KL0Yhr
// SIG // xDC/cWY9qR0VMr/rOb+1RsHDOq4zWDOKs2UDOgNkRmCR
// SIG // lO/NBkBtEDvfMPrLnLk1a30wggdxMIIFWaADAgECAhMz
// SIG // AAAAFcXna54Cm0mZAAAAAAAVMA0GCSqGSIb3DQEBCwUA
// SIG // MIGIMQswCQYDVQQGEwJVUzETMBEGA1UECBMKV2FzaGlu
// SIG // Z3RvbjEQMA4GA1UEBxMHUmVkbW9uZDEeMBwGA1UEChMV
// SIG // TWljcm9zb2Z0IENvcnBvcmF0aW9uMTIwMAYDVQQDEylN
// SIG // aWNyb3NvZnQgUm9vdCBDZXJ0aWZpY2F0ZSBBdXRob3Jp
// SIG // dHkgMjAxMDAeFw0yMTA5MzAxODIyMjVaFw0zMDA5MzAx
// SIG // ODMyMjVaMHwxCzAJBgNVBAYTAlVTMRMwEQYDVQQIEwpX
// SIG // YXNoaW5ndG9uMRAwDgYDVQQHEwdSZWRtb25kMR4wHAYD
// SIG // VQQKExVNaWNyb3NvZnQgQ29ycG9yYXRpb24xJjAkBgNV
// SIG // BAMTHU1pY3Jvc29mdCBUaW1lLVN0YW1wIFBDQSAyMDEw
// SIG // MIICIjANBgkqhkiG9w0BAQEFAAOCAg8AMIICCgKCAgEA
// SIG // 5OGmTOe0ciELeaLL1yR5vQ7VgtP97pwHB9KpbE51yMo1
// SIG // V/YBf2xK4OK9uT4XYDP/XE/HZveVU3Fa4n5KWv64NmeF
// SIG // RiMMtY0Tz3cywBAY6GB9alKDRLemjkZrBxTzxXb1hlDc
// SIG // wUTIcVxRMTegCjhuje3XD9gmU3w5YQJ6xKr9cmmvHaus
// SIG // 9ja+NSZk2pg7uhp7M62AW36MEBydUv626GIl3GoPz130
// SIG // /o5Tz9bshVZN7928jaTjkY+yOSxRnOlwaQ3KNi1wjjHI
// SIG // NSi947SHJMPgyY9+tVSP3PoFVZhtaDuaRr3tpK56KTes
// SIG // y+uDRedGbsoy1cCGMFxPLOJiss254o2I5JasAUq7vnGp
// SIG // F1tnYN74kpEeHT39IM9zfUGaRnXNxF803RKJ1v2lIH1+
// SIG // /NmeRd+2ci/bfV+AutuqfjbsNkz2K26oElHovwUDo9Fz
// SIG // pk03dJQcNIIP8BDyt0cY7afomXw/TNuvXsLz1dhzPUNO
// SIG // wTM5TI4CvEJoLhDqhFFG4tG9ahhaYQFzymeiXtcodgLi
// SIG // Mxhy16cg8ML6EgrXY28MyTZki1ugpoMhXV8wdJGUlNi5
// SIG // UPkLiWHzNgY1GIRH29wb0f2y1BzFa/ZcUlFdEtsluq9Q
// SIG // BXpsxREdcu+N+VLEhReTwDwV2xo3xwgVGD94q0W29R6H
// SIG // XtqPnhZyacaue7e3PmriLq0CAwEAAaOCAd0wggHZMBIG
// SIG // CSsGAQQBgjcVAQQFAgMBAAEwIwYJKwYBBAGCNxUCBBYE
// SIG // FCqnUv5kxJq+gpE8RjUpzxD/LwTuMB0GA1UdDgQWBBSf
// SIG // pxVdAF5iXYP05dJlpxtTNRnpcjBcBgNVHSAEVTBTMFEG
// SIG // DCsGAQQBgjdMg30BATBBMD8GCCsGAQUFBwIBFjNodHRw
// SIG // Oi8vd3d3Lm1pY3Jvc29mdC5jb20vcGtpb3BzL0RvY3Mv
// SIG // UmVwb3NpdG9yeS5odG0wEwYDVR0lBAwwCgYIKwYBBQUH
// SIG // AwgwGQYJKwYBBAGCNxQCBAweCgBTAHUAYgBDAEEwCwYD
// SIG // VR0PBAQDAgGGMA8GA1UdEwEB/wQFMAMBAf8wHwYDVR0j
// SIG // BBgwFoAU1fZWy4/oolxiaNE9lJBb186aGMQwVgYDVR0f
// SIG // BE8wTTBLoEmgR4ZFaHR0cDovL2NybC5taWNyb3NvZnQu
// SIG // Y29tL3BraS9jcmwvcHJvZHVjdHMvTWljUm9vQ2VyQXV0
// SIG // XzIwMTAtMDYtMjMuY3JsMFoGCCsGAQUFBwEBBE4wTDBK
// SIG // BggrBgEFBQcwAoY+aHR0cDovL3d3dy5taWNyb3NvZnQu
// SIG // Y29tL3BraS9jZXJ0cy9NaWNSb29DZXJBdXRfMjAxMC0w
// SIG // Ni0yMy5jcnQwDQYJKoZIhvcNAQELBQADggIBAJ1Vffwq
// SIG // reEsH2cBMSRb4Z5yS/ypb+pcFLY+TkdkeLEGk5c9MTO1
// SIG // OdfCcTY/2mRsfNB1OW27DzHkwo/7bNGhlBgi7ulmZzpT
// SIG // Td2YurYeeNg2LpypglYAA7AFvonoaeC6Ce5732pvvinL
// SIG // btg/SHUB2RjebYIM9W0jVOR4U3UkV7ndn/OOPcbzaN9l
// SIG // 9qRWqveVtihVJ9AkvUCgvxm2EhIRXT0n4ECWOKz3+SmJ
// SIG // w7wXsFSFQrP8DJ6LGYnn8AtqgcKBGUIZUnWKNsIdw2Fz
// SIG // Lixre24/LAl4FOmRsqlb30mjdAy87JGA0j3mSj5mO0+7
// SIG // hvoyGtmW9I/2kQH2zsZ0/fZMcm8Qq3UwxTSwethQ/gpY
// SIG // 3UA8x1RtnWN0SCyxTkctwRQEcb9k+SS+c23Kjgm9swFX
// SIG // SVRk2XPXfx5bRAGOWhmRaw2fpCjcZxkoJLo4S5pu+yFU
// SIG // a2pFEUep8beuyOiJXk+d0tBMdrVXVAmxaQFEfnyhYWxz
// SIG // /gq77EFmPWn9y8FBSX5+k77L+DvktxW/tM4+pTFRhLy/
// SIG // AsGConsXHRWJjXD+57XQKBqJC4822rpM+Zv/Cuk0+CQ1
// SIG // ZyvgDbjmjJnW4SLq8CdCPSWU5nR0W2rRnj7tfqAxM328
// SIG // y+l7vzhwRNGQ8cirOoo6CGJ/2XBjU02N7oJtpQUQwXEG
// SIG // ahC0HVUzWLOhcGbyoYIDTTCCAjUCAQEwgfmhgdGkgc4w
// SIG // gcsxCzAJBgNVBAYTAlVTMRMwEQYDVQQIEwpXYXNoaW5n
// SIG // dG9uMRAwDgYDVQQHEwdSZWRtb25kMR4wHAYDVQQKExVN
// SIG // aWNyb3NvZnQgQ29ycG9yYXRpb24xJTAjBgNVBAsTHE1p
// SIG // Y3Jvc29mdCBBbWVyaWNhIE9wZXJhdGlvbnMxJzAlBgNV
// SIG // BAsTHm5TaGllbGQgVFNTIEVTTjo4NjAzLTA1RTAtRDk0
// SIG // NzElMCMGA1UEAxMcTWljcm9zb2Z0IFRpbWUtU3RhbXAg
// SIG // U2VydmljZaIjCgEBMAcGBSsOAwIaAxUA071VP2I/ZVEs
// SIG // ngwmoidg2uYVIkuggYMwgYCkfjB8MQswCQYDVQQGEwJV
// SIG // UzETMBEGA1UECBMKV2FzaGluZ3RvbjEQMA4GA1UEBxMH
// SIG // UmVkbW9uZDEeMBwGA1UEChMVTWljcm9zb2Z0IENvcnBv
// SIG // cmF0aW9uMSYwJAYDVQQDEx1NaWNyb3NvZnQgVGltZS1T
// SIG // dGFtcCBQQ0EgMjAxMDANBgkqhkiG9w0BAQsFAAIFAO0P
// SIG // qBMwIhgPMjAyNjAxMTIxNzA0MTlaGA8yMDI2MDExMzE3
// SIG // MDQxOVowdDA6BgorBgEEAYRZCgQBMSwwKjAKAgUA7Q+o
// SIG // EwIBADAHAgEAAgIpPDAHAgEAAgIVFzAKAgUA7RD5kwIB
// SIG // ADA2BgorBgEEAYRZCgQCMSgwJjAMBgorBgEEAYRZCgMC
// SIG // oAowCAIBAAIDB6EgoQowCAIBAAIDAYagMA0GCSqGSIb3
// SIG // DQEBCwUAA4IBAQCczHD0d6OwjMg1p7IEyLWaeRnJcLXW
// SIG // 7WT0R96b0ROyoBj4Zm4VDE/gzLRqw0VS9yWUMJs/5lF9
// SIG // iGbgUkH4qr+SyPfJ8VJ/rkFoUn6fh/U3b3HS4FMwKujO
// SIG // LRmBQ0GnWWMuuzYGe7sqKEdgIR+c/sTbnSefA9+N1Fne
// SIG // hdOWqRJB+R23Mp2d7bS6wBVC+IOLd+881OD4Aqj0so98
// SIG // xKziJeTj3wFiE/IBCw8NpgyhJumUgWPJmJ61nd/JX3sI
// SIG // D1oexzifCCclO5rjkrlMUE21tbNJUksBU4TzJu8lTtwj
// SIG // 7APuUvd1IklPbQaCvVZIHo9I8G6lQfL4l16YATOZVkOJ
// SIG // 6dv4MYIEDTCCBAkCAQEwgZMwfDELMAkGA1UEBhMCVVMx
// SIG // EzARBgNVBAgTCldhc2hpbmd0b24xEDAOBgNVBAcTB1Jl
// SIG // ZG1vbmQxHjAcBgNVBAoTFU1pY3Jvc29mdCBDb3Jwb3Jh
// SIG // dGlvbjEmMCQGA1UEAxMdTWljcm9zb2Z0IFRpbWUtU3Rh
// SIG // bXAgUENBIDIwMTACEzMAAAIHLBE5ic2F+8UAAQAAAgcw
// SIG // DQYJYIZIAWUDBAIBBQCgggFKMBoGCSqGSIb3DQEJAzEN
// SIG // BgsqhkiG9w0BCRABBDAvBgkqhkiG9w0BCQQxIgQgU83v
// SIG // N79DuHP5QCOLJoOjkv3iaZBglZEkN2opAHsQvEEwgfoG
// SIG // CyqGSIb3DQEJEAIvMYHqMIHnMIHkMIG9BCAv99TR0HbN
// SIG // SGebD57+fafr+gYwQ4KAzyMIgJp9Dx6nszCBmDCBgKR+
// SIG // MHwxCzAJBgNVBAYTAlVTMRMwEQYDVQQIEwpXYXNoaW5n
// SIG // dG9uMRAwDgYDVQQHEwdSZWRtb25kMR4wHAYDVQQKExVN
// SIG // aWNyb3NvZnQgQ29ycG9yYXRpb24xJjAkBgNVBAMTHU1p
// SIG // Y3Jvc29mdCBUaW1lLVN0YW1wIFBDQSAyMDEwAhMzAAAC
// SIG // BywROYnNhfvFAAEAAAIHMCIEILui/Ra1pxse2v0YWl37
// SIG // Zx76m8kgRSOeYSj8rfp10E8LMA0GCSqGSIb3DQEBCwUA
// SIG // BIICABHetkedasTcBFuI2H6Gvf1kpsZpjWIfo8p0Jm/X
// SIG // 1F+TZydSCjXpW5QtnLOpGp5JEfSoxWmvxfPrh4lhPdpO
// SIG // dNCd2YMLbx/SW3ii1oDjfhiCbFX9/Pbem6auRFj9ZM9T
// SIG // J2Jm3NBjI/6ymkWnN7YXX183PO/YfK8FYAuMPBE8r0tC
// SIG // Wzeny0OP1yLQGGH6700McZ3g9M9I/yvlT3d9RNw8VNcA
// SIG // tlw235all8ZD9Q3/TW943iMOUzE9jRb/s1i0ZlytWWbp
// SIG // yOUMjMTEXLoEtKj4yPzvkzvSSv+z+Wc+O5nlV7dsnOHT
// SIG // GZYFyjL2y+oPEcdYL/bs7WfvL3AVI3wrbxRBlByl9+ry
// SIG // k7oeyMd3WqwzrDhNon6gUFfRLM1yB0NriQe7Zs1FzGHZ
// SIG // BqDNy43isj2Q85D9Sh0on2GBE9r1CEAP8QClw3X9lCSw
// SIG // Bx5Uetzx+cDolZY1eax6p9itqO18i9vaRU+iyb/44d9P
// SIG // PbV+2+MxJrThkO1cgRfKy7EeZ4aHYbCklJFLoPOHeNTS
// SIG // LJDOGE8FufgH6+VisdC1xCkKRtSzX8wbXfSqpWKr4jx/
// SIG // u3bGccr+vAAOmw9BXU8S4NSsREByOZJtZZpPuTCohisB
// SIG // wW5Q9E1keSBUYK8rcS6YZ38Wc4FFfnCvgraUd3wnaYo6
// SIG // ydvkfUqaGv2oo9FauprRK4HhMmft
// SIG // End signature block
