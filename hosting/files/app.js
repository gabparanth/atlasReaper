const client = stitch.Stitch.initializeDefaultAppClient('atlasreaper-pmpzl');

function checkAuth(callback) {
    if (!client.auth.isLoggedIn) {
        if (client.auth.hasRedirectResult()) {
            client.auth.handleRedirectResult().then(user => {
                callback(true);
            });
        } else {
            const credential = new stitch.GoogleRedirectCredential();
            client.auth.loginWithRedirect(credential);
        }
    } else {
        callback(true)
    }

}




function addToList(project, clustername) {
    var projectName = document.getElementById('projectName').value;
    var clusterName = document.getElementById('clusterName').value;

    checkAuth(function (user) {
        var newRecord = {
            "userid": client.auth.user.id,
            "email": client.auth.user.profile.email,
            "projectName": projectName,
            "clusterName": clusterName
        }

        client.callFunction('addClusterName', [newRecord]).then((result) => {
            getList(function (clusters) {
                printList(clusters);
            })
        });

    })
}




function removeFromList(id, projectName, clusterName, ownerEmail) {
    if (client.auth.user.profile.email == ownerEmail) {
        var confirmation = confirm(`Are you sure you want to remove ${projectName}/${clusterName}?`);
        if (confirmation) {
            client.callFunction('removeClusterName', [id]).then((result) => {
                getList(function (clusters) {
                    printList(clusters);
                })
            })
        }
    } else {
        alert('You can only remove your own items!')
    }


}

function getList(callback) {
    checkAuth(function (isAuthenticated) {
        client.callFunction('getClusters', []).then((clusters) => {
            callback(clusters);
        });
    })
}

function printList(clusters) {
    var table = document.getElementById('clusterList');

    table.innerHTML = `<tr class=table-body>
    <td>
      Project Name
    </td>
    <td>
      Cluster Name
    </td>
    <td>
    Status
    </td>
    <td>
    Edit configuration
    </td>
    <td>
              
    </td>
  </tr>`;

    clusters.forEach((cluster) => {
        var row = document.createElement('tr');
        row.setAttribute('class', 'table-body');
        // var tblUser = document.createElement('td');
        var tblProject = document.createElement('td');
        var tblCluster = document.createElement('td');
        // var tblDelete = document.createElement('td');
        // var tblWhitelisted = document.createElement('td');

        var tblStatus = document.createElement('td');
        var tblEditconfiguration = document.createElement('td');

        // tblUser.innerHTML = cluster.email;
        tblProject.innerHTML = cluster.project_name;
        tblCluster.innerHTML = cluster.cluster_name;
        tblStatus.innerHTML = cluster.whitelistingPolicy;
        // tblWhitelisted.innerHTML = cluster.pausedCluster;

        var editConfigurationButton = document.createElement('button');
        editConfigurationButton.innerHTML = "..."
        editConfigurationButton.setAttribute('onclick', `editConfiguration('${cluster._id}','${cluster.project_name}','${cluster.cluster_name}','${cluster.whitelistingPolicy}')`);
        editConfigurationButton.setAttribute('class', 'three-dot-button');
        tblEditconfiguration.appendChild(editConfigurationButton);



        // if (cluster.pausedCluster == true ){

        //     reapButton.innerHTML = "unPause";
        //     reapButton.setAttribute('onclick', `unPause('${cluster._id}','${cluster.projectName}','${cluster.clusterName}','${cluster.email}')`);

        // } else {
            
        //     reapButton.innerHTML = "Pause";
        //     reapButton.setAttribute('onclick', `pause('${cluster._id}','${cluster.projectName}','${cluster.clusterName}','${cluster.email}')`);

        // }

        // tblWhitelisted.appendChild(reapButton);

    

        // var deleteButton = document.createElement('button');
        // deleteButton.setAttribute('onclick', `removeFromList('${cluster._id}','${cluster.projectName}','${cluster.clusterName}','${cluster.email}')`);
        // deleteButton.innerHTML = "Remove";
        // tblDelete.appendChild(deleteButton);

        // row.appendChild(tblUser);
        row.appendChild(tblProject);
        row.appendChild(tblCluster);
        row.appendChild(tblStatus);
        row.appendChild(tblEditconfiguration);

        table.appendChild(row);
    })
}

function editConfiguration(id, projectName, clusterName, whitelistingPolicy) {
    // if (client.auth.user.profile.email == ownerEmail) {
    //     var confirmation = confirm(`Are you sure you want to remove ${projectName}/${clusterName}?`);
    //     if (confirmation) {
    //         client.callFunction('removeClusterName', [id]).then((result) => {
    //             getList(function (clusters) {
    //                 printList(clusters);
    //             })
    //         })
    //     }
    // } else {
    //     alert('You can only remove your own items!')
    // }

    // client.callFunction('addPausedCluster', [id]).then((result) => {
    //     getList(function (clusters) {
    //         printList(clusters);
    //     })
    // })


    if (whitelistingPolicy == "PAUSED"){
        document.getElementById("radioPaused").checked = true;
    }else if (whitelistingPolicy == "ANYTIME"){
        document.getElementById("radioAnytime").checked = true;
    }else if (whitelistingPolicy == "OFFICE_HOURS"){
        document.getElementById("radioOfficeHours").checked = true;
    }else if (whitelistingPolicy == "FULL_CONTROL"){
        document.getElementById("radiofullcontrol").checked = true;
    }
        
    document.getElementById("myForm").style.display = "block";
    document.getElementById("submitFormButton").setAttribute('onclick', `submitForm('${id}')`);
    
}

function submitForm(id) {
    var ele = document.querySelector('input[name="radio"]:checked').value;
    console.log(ele);
    client.callFunction('updateWhitelistingPolicy', [id, ele]).then(() => {
        getList(function (clusters) {
            printList(clusters);
            document.getElementById("myForm").style.display = "none"
        })  
    })
    
}

function updateList() {
    document.getElementById("loader").style.display = "block";
    client.callFunction('updateClustersCollection').then(() => {
        getList(function (clusters) {
            printList(clusters);
            document.getElementById("loader").style.display = "none";
        })  
        console.log('refresh done')
    });
}

function closeForm() {
    document.getElementById("myForm").style.display = "none";
  }

// function unPause(id, projectName, clusterName, ownerEmail) {
//     // if (client.auth.user.profile.email == ownerEmail) {
//     //     var confirmation = confirm(`Are you sure you want to remove ${projectName}/${clusterName}?`);
//     //     if (confirmation) {
//     //         client.callFunction('removeClusterName', [id]).then((result) => {
//     //             getList(function (clusters) {
//     //                 printList(clusters);
//     //             })
//     //         })
//     //     }
//     // } else {
//     //     alert('You can only remove your own items!')
//     // }
//     client.callFunction('removePausedCluster', [id]).then((result) => {
//         getList(function (clusters) {
//             printList(clusters);
//         })
//     })

// }



getList(function (clusters) {
    printList(clusters);
});

